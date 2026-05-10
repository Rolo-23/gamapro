import { Router, Request, Response } from 'express';
import { getConnection, sql } from '../config/database';
import { dbClientToClient, dbLoanToLoan, dbAppointmentToAppointment } from '../utils/converters';

const router = Router();

// Obtener todos los clientes
router.get('/', async (req: Request, res: Response) => {
  try {
    const pool = await getConnection();
    
    // Obtener clientes activos
    const clientesResult = await pool.request().query(`
      SELECT * FROM clientes 
      WHERE activo = 1 
      ORDER BY apellido, nombre
    `);

    const clientes = clientesResult.recordset;

    // Obtener préstamos y turnos para cada cliente
    const clientsWithRelations = await Promise.all(
      clientes.map(async (dbClient: any) => {
        // Obtener préstamos
        const prestamosResult = await pool.request()
          .input('clienteId', sql.UniqueIdentifier, dbClient.id)
          .query('SELECT * FROM prestamos WHERE cliente_id = @clienteId ORDER BY fecha_prestamo DESC');

        // Obtener turnos
        const turnosResult = await pool.request()
          .input('clienteId', sql.UniqueIdentifier, dbClient.id)
          .query('SELECT * FROM turnos WHERE cliente_id = @clienteId ORDER BY dia DESC');

        const loans = prestamosResult.recordset.map(dbLoanToLoan);
        const appointments = turnosResult.recordset.map(dbAppointmentToAppointment);

        return dbClientToClient(dbClient, loans, appointments);
      })
    );

    res.json(clientsWithRelations);
  } catch (error: any) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({ error: error.message || 'Error al obtener clientes' });
  }
});

// Obtener un cliente por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const pool = await getConnection();
    const { id } = req.params;

    const clienteResult = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .query('SELECT * FROM clientes WHERE id = @id AND activo = 1');

    if (clienteResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const dbClient = clienteResult.recordset[0];

    // Obtener préstamos
    const prestamosResult = await pool.request()
      .input('clienteId', sql.UniqueIdentifier, id)
      .query('SELECT * FROM prestamos WHERE cliente_id = @clienteId ORDER BY fecha_prestamo DESC');

    // Obtener turnos
    const turnosResult = await pool.request()
      .input('clienteId', sql.UniqueIdentifier, id)
      .query('SELECT * FROM turnos WHERE cliente_id = @clienteId ORDER BY dia DESC');

    const loans = prestamosResult.recordset.map(dbLoanToLoan);
    const appointments = turnosResult.recordset.map(dbAppointmentToAppointment);

    const client = dbClientToClient(dbClient, loans, appointments);
    res.json(client);
  } catch (error: any) {
    console.error('Error obteniendo cliente:', error);
    res.status(500).json({ error: error.message || 'Error al obtener cliente' });
  }
});

// Crear un nuevo cliente
router.post('/', async (req: Request, res: Response) => {
  try {
    const pool = await getConnection();
    const clientData = req.body;

    // Validar datos requeridos
    if (!clientData.dni || !clientData.nombre || !clientData.apellido) {
      return res.status(400).json({ error: 'DNI, nombre y apellido son requeridos' });
    }

    const result = await pool.request()
      .input('dni', sql.NVarChar(20), clientData.dni)
      .input('nombre', sql.NVarChar(100), clientData.nombre)
      .input('apellido', sql.NVarChar(100), clientData.apellido)
      .input('donde_vive', sql.NVarChar(200), clientData.dondeVive)
      .input('estado_civil', sql.NVarChar(20), clientData.estadoCivil)
      .input('condiciones_vivienda', sql.NVarChar(sql.MAX), clientData.condicionesVivienda || '')
      .input('maneja_tecnologia', sql.Bit, clientData.manejaTecnologia || false)
      .input('celular', sql.NVarChar(20), clientData.celular || '')
      .input('familiar_contacto_nombre', sql.NVarChar(200), clientData.familiarContacto?.nombre || '')
      .input('familiar_contacto_telefono', sql.NVarChar(20), clientData.familiarContacto?.telefono || null)
      .input('medico_cabecera', sql.NVarChar(200), clientData.medicoCabecera || '')
      .input('fecha_nacimiento', sql.Date, clientData.fechaNacimiento)
      .query(`
        INSERT INTO clientes (dni, nombre, apellido, donde_vive, estado_civil, 
          condiciones_vivienda, maneja_tecnologia, celular, familiar_contacto_nombre, 
          familiar_contacto_telefono, medico_cabecera, fecha_nacimiento, activo)
        OUTPUT INSERTED.id, INSERTED.*
        VALUES (@dni, @nombre, @apellido, @donde_vive, @estado_civil, 
          @condiciones_vivienda, @maneja_tecnologia, @celular, @familiar_contacto_nombre, 
          @familiar_contacto_telefono, @medico_cabecera, @fecha_nacimiento, 1)
      `);

    const newClient = result.recordset[0];

    // Si hay préstamos o turnos, insertarlos
    if (clientData.prestamos && clientData.prestamos.length > 0) {
      for (const loan of clientData.prestamos) {
        await pool.request()
          .input('cliente_id', sql.UniqueIdentifier, newClient.id)
          .input('quien_presta', sql.NVarChar(200), loan.quienPresta)
          .input('item', sql.NVarChar(200), loan.item)
          .input('estado', sql.NVarChar(20), loan.estado || 'prestado')
          .input('fecha_prestamo', sql.Date, loan.fecha)
          .input('fecha_devolucion', sql.Date, loan.estado === 'devuelto' ? loan.fecha : null)
          .query(`
            INSERT INTO prestamos (cliente_id, quien_presta, item, estado, fecha_prestamo, fecha_devolucion)
            VALUES (@cliente_id, @quien_presta, @item, @estado, @fecha_prestamo, @fecha_devolucion)
          `);
      }
    }

    if (clientData.turnos && clientData.turnos.length > 0) {
      for (const turno of clientData.turnos) {
        await pool.request()
          .input('cliente_id', sql.UniqueIdentifier, newClient.id)
          .input('lugar', sql.NVarChar(200), turno.lugar)
          .input('dia', sql.Date, turno.dia)
          .input('medico', sql.NVarChar(200), turno.medico)
          .input('hora', sql.Time, turno.hora)
          .query(`
            INSERT INTO turnos (cliente_id, lugar, dia, medico, hora, estado)
            VALUES (@cliente_id, @lugar, @dia, @medico, @hora, 'programado')
          `);
      }
    }

    // Obtener el cliente completo con relaciones
    const prestamosResult = await pool.request()
      .input('clienteId', sql.UniqueIdentifier, newClient.id)
      .query('SELECT * FROM prestamos WHERE cliente_id = @clienteId ORDER BY fecha_prestamo DESC');

    const turnosResult = await pool.request()
      .input('clienteId', sql.UniqueIdentifier, newClient.id)
      .query('SELECT * FROM turnos WHERE cliente_id = @clienteId ORDER BY dia DESC');

    const loans = prestamosResult.recordset.map(dbLoanToLoan);
    const appointments = turnosResult.recordset.map(dbAppointmentToAppointment);

    const client = dbClientToClient(newClient, loans, appointments);
    res.status(201).json(client);
  } catch (error: any) {
    console.error('Error creando cliente:', error);
    if (error.number === 2627) { // Violación de clave única
      return res.status(400).json({ error: 'El DNI ya existe' });
    }
    res.status(500).json({ error: error.message || 'Error al crear cliente' });
  }
});

// Actualizar un cliente
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const pool = await getConnection();
    const { id } = req.params;
    const clientData = req.body;

    // Actualizar cliente
    const updateResult = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('dni', sql.NVarChar(20), clientData.dni)
      .input('nombre', sql.NVarChar(100), clientData.nombre)
      .input('apellido', sql.NVarChar(100), clientData.apellido)
      .input('donde_vive', sql.NVarChar(200), clientData.dondeVive)
      .input('estado_civil', sql.NVarChar(20), clientData.estadoCivil)
      .input('condiciones_vivienda', sql.NVarChar(sql.MAX), clientData.condicionesVivienda || '')
      .input('maneja_tecnologia', sql.Bit, clientData.manejaTecnologia || false)
      .input('celular', sql.NVarChar(20), clientData.celular || '')
      .input('familiar_contacto_nombre', sql.NVarChar(200), clientData.familiarContacto?.nombre || '')
      .input('familiar_contacto_telefono', sql.NVarChar(20), clientData.familiarContacto?.telefono || null)
      .input('medico_cabecera', sql.NVarChar(200), clientData.medicoCabecera || '')
      .input('fecha_nacimiento', sql.Date, clientData.fechaNacimiento)
      .query(`
        UPDATE clientes 
        SET dni = @dni, nombre = @nombre, apellido = @apellido, 
            donde_vive = @donde_vive, estado_civil = @estado_civil,
            condiciones_vivienda = @condiciones_vivienda, 
            maneja_tecnologia = @maneja_tecnologia, celular = @celular,
            familiar_contacto_nombre = @familiar_contacto_nombre,
            familiar_contacto_telefono = @familiar_contacto_telefono,
            medico_cabecera = @medico_cabecera, fecha_nacimiento = @fecha_nacimiento
        WHERE id = @id AND activo = 1
      `);

    if (updateResult.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Eliminar préstamos y turnos existentes
    await pool.request()
      .input('cliente_id', sql.UniqueIdentifier, id)
      .query('DELETE FROM prestamos WHERE cliente_id = @cliente_id');

    await pool.request()
      .input('cliente_id', sql.UniqueIdentifier, id)
      .query('DELETE FROM turnos WHERE cliente_id = @cliente_id');

    // Insertar nuevos préstamos
    if (clientData.prestamos && clientData.prestamos.length > 0) {
      for (const loan of clientData.prestamos) {
        await pool.request()
          .input('cliente_id', sql.UniqueIdentifier, id)
          .input('quien_presta', sql.NVarChar(200), loan.quienPresta)
          .input('item', sql.NVarChar(200), loan.item)
          .input('estado', sql.NVarChar(20), loan.estado || 'prestado')
          .input('fecha_prestamo', sql.Date, loan.fecha)
          .input('fecha_devolucion', sql.Date, loan.estado === 'devuelto' ? loan.fecha : null)
          .query(`
            INSERT INTO prestamos (cliente_id, quien_presta, item, estado, fecha_prestamo, fecha_devolucion)
            VALUES (@cliente_id, @quien_presta, @item, @estado, @fecha_prestamo, @fecha_devolucion)
          `);
      }
    }

    // Insertar nuevos turnos
    if (clientData.turnos && clientData.turnos.length > 0) {
      for (const turno of clientData.turnos) {
        await pool.request()
          .input('cliente_id', sql.UniqueIdentifier, id)
          .input('lugar', sql.NVarChar(200), turno.lugar)
          .input('dia', sql.Date, turno.dia)
          .input('medico', sql.NVarChar(200), turno.medico)
          .input('hora', sql.Time, turno.hora)
          .query(`
            INSERT INTO turnos (cliente_id, lugar, dia, medico, hora, estado)
            VALUES (@cliente_id, @lugar, @dia, @medico, @hora, 'programado')
          `);
      }
    }

    // Obtener el cliente actualizado
    const clienteResult = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .query('SELECT * FROM clientes WHERE id = @id AND activo = 1');

    const prestamosResult = await pool.request()
      .input('clienteId', sql.UniqueIdentifier, id)
      .query('SELECT * FROM prestamos WHERE cliente_id = @clienteId ORDER BY fecha_prestamo DESC');

    const turnosResult = await pool.request()
      .input('clienteId', sql.UniqueIdentifier, id)
      .query('SELECT * FROM turnos WHERE cliente_id = @clienteId ORDER BY dia DESC');

    const loans = prestamosResult.recordset.map(dbLoanToLoan);
    const appointments = turnosResult.recordset.map(dbAppointmentToAppointment);

    const client = dbClientToClient(clienteResult.recordset[0], loans, appointments);
    res.json(client);
  } catch (error: any) {
    console.error('Error actualizando cliente:', error);
    res.status(500).json({ error: error.message || 'Error al actualizar cliente' });
  }
});

// Eliminar un cliente (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const pool = await getConnection();
    const { id } = req.params;

    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .query('UPDATE clientes SET activo = 0 WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({ id, message: 'Cliente eliminado correctamente' });
  } catch (error: any) {
    console.error('Error eliminando cliente:', error);
    res.status(500).json({ error: error.message || 'Error al eliminar cliente' });
  }
});

export default router;

