import uuid
from sqlalchemy import Column, String, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database.connection import Base


class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    short_code = Column(String(10), unique=True)
    address = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    locations = relationship("Location", back_populates="warehouse")


class Location(Base):
    __tablename__ = "locations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    warehouse_id = Column(UUID(as_uuid=True), ForeignKey("warehouses.id"), nullable=False)
    name = Column(String(100), nullable=False)
    short_code = Column(String(10))
    is_active = Column(Boolean, default=True)

    warehouse = relationship("Warehouse", back_populates="locations")
