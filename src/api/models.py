from flask_sqlalchemy import SQLAlchemy
import uuid
from datetime import datetime, time

from sqlalchemy import Index, and_

db = SQLAlchemy()

class Reserva(db.Model):
    __tablename__ = 'reserva'
    __table_args__ = (
        # Índice único sólo para reservas activas (no canceladas) por fecha y hora
        Index(
            'unique_fecha_hora_active_reservas', 
            'fecha', 'hora', 
            unique=True,
            postgresql_where=and_(db.text("cancelada = false"))
        ),
    )

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    telefono = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    hora = db.Column(db.Time, nullable=False)
    servicio = db.Column(db.String(100), nullable=True)
    token = db.Column(db.String(50), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    cancelada = db.Column(db.Boolean, default=False, nullable=False)
    creado_en = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    precio = db.Column(db.Float, nullable=False, default=0.0)
    direccion = db.Column(db.String(250), nullable=True)          # Nuevo campo opcional
    variante_precio = db.Column(db.String(100), nullable=True)    # Nuevo campo opcional

    def __repr__(self):
        return f'<Reserva {self.fecha} {self.hora} - {self.nombre}>'

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "email": self.email,
            "telefono": self.telefono,
            "fecha": self.fecha.isoformat(),
            "hora": self.hora.strftime('%H:%M'),
            "servicio": self.servicio,
            "precio": self.precio,
            "token": self.token,
            "cancelada": self.cancelada,
            "creado_en": self.creado_en.isoformat(),
            "direccion": self.direccion or "",
            "variante_precio": self.variante_precio or "",
        }


class Bloqueo(db.Model):
    __tablename__ = 'bloqueo'
    __table_args__ = (
        Index('unique_fecha_hora_bloqueo', 'fecha', 'hora', unique=True),
    )

    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.Date, nullable=False)
    hora = db.Column(db.Time, nullable=False)
    bloqueado = db.Column(db.Boolean, nullable=False, default=True)
    nombre = db.Column(db.String(100), nullable=True)
    servicio = db.Column(db.String(100), nullable=True)

    def __repr__(self):
        return f'<Bloqueo {self.fecha} {self.hora} - {self.nombre}>'

    def serialize(self):
        return {
            "id": self.id,
            "fecha": self.fecha.isoformat(),
            "hora": self.hora.strftime('%H:%M'),
            "bloqueado": self.bloqueado,
            "nombre": self.nombre or '',
            "servicio": self.servicio or ''
        }

class Testimonio(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    comentario = db.Column(db.Text, nullable=False)
    estrellas = db.Column(db.Integer, default=5, nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f'<Testimonio {self.nombre} - {self.estrellas} estrellas>'

    def serialize(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'comentario': self.comentario,
            'estrellas': self.estrellas,
            'fecha': self.fecha.isoformat()
        }
