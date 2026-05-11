import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { dbClientToClient, dbLoanToLoan, dbAppointmentToAppointment } from '../utils/converters';

const router = Router();

// ──────────────────────────────────────────────
// GET / — Obtener todos los clientes activos
// ──────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response) => {
  try {
    const clientes = await query(
      `SELECT * FROM clientes WHERE activo = TRUE ORDER BY apellido, nombre`
    );

    const clientsWithRelations = await Promise.all(
      clientes.map(async (dbClient: any) => {
        const loans = await query(
          `SELECT * FROM prestamos WHERE cliente_id = $1 ORDER BY fecha_prestamo DESC`,
          [dbClient.id]
        );
        const appointments = await query(
          `SELECT * FROM turnos WHERE cliente_id = $1 ORDER BY dia DESC`,
          [dbClient.id]
        );
        return dbClientToClient(dbClient, loans.map(dbLoanToLoan), appointments.map(dbAppointmentToAppointment));
      })
    );

    res.json(clientsWithRelations);
  } catch (error: any) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({ error: error.message || 'Error al obtener clientes' });
  }
});

// ──────────────────────────────────────────────
// GET /:id — Obtener un cliente por ID
// ──────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const clientes = await query(
      `SELECT * FROM clientes WHERE id = $1 AND activo = TRUE`,
      [id]
    );

    if (clientes.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const dbClient = clientes[0];
    const loans = await query(
      `SELECT * FROM prestamos WHERE cliente_id = $1 ORDER BY fecha_prestamo DESC`,
      [id]
    );
    const appointments = await query(
      `SELECT * FROM turnos WHERE cliente_id = $1 ORDER BY dia DESC`,
      [id]
    );

    res.json(dbClientToClient(dbClient, loans.map(dbLoanToLoan), appointments.map(dbAppointmentToAppointment)));
  } catch (error: any) {
    console.error('Error obteniendo cliente:', error);
    res.status(500).json({ error: error.message || 'Error al obtener cliente' });
  }
});

// ──────────────────────────────────────────────
// POST / — Crear un nuevo cliente
// ──────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const d = req.body;

    if (!d.dni || !d.nombre || !d.apellido) {
      return res.status(400).json({ error: 'DNI, nombre y apellido son requeridos' });
    }

    const result = await query(
      `INSERT INTO clientes (
        dni, nombre, apellido, donde_vive, estado_civil,
        condiciones_vivienda, maneja_tecnologia, celular,
        familiar_contacto_nombre, familiar_contacto_telefono,
        medico_cabecera, fecha_nacimiento, activo
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,TRUE)
      RETURNING *`,
      [
        d.dni,
        d.nombre,
        d.apellido,
        d.dondeVive,
        d.estadoCivil,
        d.condicionesVivienda || '',
        d.manejaTecnologia || false,
        d.celular || '',
        d.familiarContacto?.nombre || '',
        d.familiarContacto?.telefono || null,
        d.medicoCabecera || '',
        d.fechaNacimiento,
      ]
    );

    const newClient = result[0];

    // Insertar préstamos iniciales si los hay
    if (d.prestamos?.length > 0) {
      for (const loan of d.prestamos) {
        await query(
          `INSERT INTO prestamos (cliente_id, quien_presta, item, estado, fecha_prestamo, fecha_devolucion)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [
            newClient.id,
            loan.quienPresta,
            loan.item,
            loan.estado || 'prestado',
            loan.fecha,
            loan.estado === 'devuelto' ? loan.fecha : null,
          ]
        );
      }
    }

    // Insertar turnos iniciales si los hay
    if (d.turnos?.length > 0) {
      for (const turno of d.turnos) {
        await query(
          `INSERT INTO turnos (cliente_id, lugar, dia, medico, hora, estado)
           VALUES ($1,$2,$3,$4,$5,'programado')`,
          [newClient.id, turno.lugar, turno.dia, turno.medico, turno.hora]
        );
      }
    }

    const loans = await query(
      `SELECT * FROM prestamos WHERE cliente_id = $1 ORDER BY fecha_prestamo DESC`,
      [newClient.id]
    );
    const appointments = await query(
      `SELECT * FROM turnos WHERE cliente_id = $1 ORDER BY dia DESC`,
      [newClient.id]
    );

    res.status(201).json(dbClientToClient(newClient, loans.map(dbLoanToLoan), appointments.map(dbAppointmentToAppointment)));
  } catch (error: any) {
    console.error('Error creando cliente:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El DNI ya existe' });
    }
    res.status(500).json({ error: error.message || 'Error al crear cliente' });
  }
});

// ──────────────────────────────────────────────
// PUT /:id — Actualizar un cliente
// ──────────────────────────────────────────────
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const d = req.body;

    const updated = await query(
      `UPDATE clientes SET
        dni = $1, nombre = $2, apellido = $3, donde_vive = $4,
        estado_civil = $5, condiciones_vivienda = $6,
        maneja_tecnologia = $7, celular = $8,
        familiar_contacto_nombre = $9, familiar_contacto_telefono = $10,
        medico_cabecera = $11, fecha_nacimiento = $12
      WHERE id = $13 AND activo = TRUE
      RETURNING *`,
      [
        d.dni,
        d.nombre,
        d.apellido,
        d.dondeVive,
        d.estadoCivil,
        d.condicionesVivienda || '',
        d.manejaTecnologia || false,
        d.celular || '',
        d.familiarContacto?.nombre || '',
        d.familiarContacto?.telefono || null,
        d.medicoCabecera || '',
        d.fechaNacimiento,
        id,
      ]
    );

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Reemplazar préstamos
    await query(`DELETE FROM prestamos WHERE cliente_id = $1`, [id]);
    if (d.prestamos?.length > 0) {
      for (const loan of d.prestamos) {
        await query(
          `INSERT INTO prestamos (cliente_id, quien_presta, item, estado, fecha_prestamo, fecha_devolucion)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [
            id,
            loan.quienPresta,
            loan.item,
            loan.estado || 'prestado',
            loan.fecha,
            loan.estado === 'devuelto' ? loan.fecha : null,
          ]
        );
      }
    }

    // Reemplazar turnos
    await query(`DELETE FROM turnos WHERE cliente_id = $1`, [id]);
    if (d.turnos?.length > 0) {
      for (const turno of d.turnos) {
        await query(
          `INSERT INTO turnos (cliente_id, lugar, dia, medico, hora, estado)
           VALUES ($1,$2,$3,$4,$5,'programado')`,
          [id, turno.lugar, turno.dia, turno.medico, turno.hora]
        );
      }
    }

    const loans = await query(
      `SELECT * FROM prestamos WHERE cliente_id = $1 ORDER BY fecha_prestamo DESC`,
      [id]
    );
    const appointments = await query(
      `SELECT * FROM turnos WHERE cliente_id = $1 ORDER BY dia DESC`,
      [id]
    );

    res.json(dbClientToClient(updated[0], loans.map(dbLoanToLoan), appointments.map(dbAppointmentToAppointment)));
  } catch (error: any) {
    console.error('Error actualizando cliente:', error);
    res.status(500).json({ error: error.message || 'Error al actualizar cliente' });
  }
});

// ──────────────────────────────────────────────
// DELETE /:id — Soft delete de un cliente
// ──────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE clientes SET activo = FALSE WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({ id, message: 'Cliente eliminado correctamente' });
  } catch (error: any) {
    console.error('Error eliminando cliente:', error);
    res.status(500).json({ error: error.message || 'Error al eliminar cliente' });
  }
});

export default router;
