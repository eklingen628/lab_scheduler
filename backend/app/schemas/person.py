from pydantic import BaseModel, ConfigDict

# Base holds shared fields.
# Create is the request body for POST. No id (DB assigns it).
# Read is the response body. Includes id. The from_attributes=True lets Pydantic build it from a SQLAlchemy object directly.



# Add Update later when you need PATCH — usually all fields nullable.


class PersonBase(BaseModel):
    first_name: str
    last_name: str
    username: str

class PersonCreate(PersonBase):
    pass  # same fields as base; separate class so you can diverge later

class PersonRead(PersonBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)

class PersonUpdate(PersonBase):
    pass