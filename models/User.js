function createUserModel(db) {
  const collection = db.collection("users");

  async function create(userData) {
    const { id, name, email, role = "user" } = userData;

    const existingUser = await collection.findOne({ _id: id });
    if (existingUser) {
      const error = new Error("User already exists");
      error.user = existingUser;
      throw error;
    }

    const newUser = {
      _id: id,
      name,
      email,
      role,
    };

    await collection.insertOne(newUser);
    return newUser;
  }

  async function findById(id) {
    return collection.findOne({ _id: id });
  }

  async function updateById(id, updateData) {
    const allowedFields = ["name", "email"];
    const filteredData = {};

    for (const key of Object.keys(updateData)) {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    }

    return collection.updateOne({ _id: id }, { $set: filteredData });
  }

  async function deleteById(id) {
    return collection.deleteOne({ _id: id });
  }

  async function findAll() {
    return collection.find({}).toArray();
  }

  return {
    create,
    findById,
    updateById,
    deleteById,
    findAll,
  };
}

module.exports = createUserModel;
