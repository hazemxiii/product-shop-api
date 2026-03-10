function createUserModel(db) {
  const collection = db.collection("users");

  async function create(userData) {
    const {
      id,
      name,
      email,
      role = "user",
      isPaused = false,
      favorites = [],
    } = userData;

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
      isPaused,
      favorites,
    };

    await collection.insertOne(newUser);
    return newUser;
  }

  async function findById(id) {
    return collection.findOne({ _id: id });
  }

  async function updateById(id, updateData) {
    const allowedFields = ["name", "email", "isPaused", "address"];
    const filteredData = {};

    for (const key of Object.keys(updateData)) {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    }

    return collection.updateOne({ _id: id }, { $set: filteredData });
  }

  async function getFavorites(id) {
    return collection
      .aggregate([
        { $match: { _id: id } },
        {
          $addFields: {
            favoritesIds: {
              $map: {
                input: "$favorites",
                as: "fav",
                in: { $toObjectId: "$$fav" },
              },
            },
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "favoritesIds",
            foreignField: "_id",
            as: "favouriteProducts",
          },
        },
        { $project: { favouriteProducts: 1, _id: 0 } },
      ])
      .toArray();
  }

  async function addToFavorites(id, productId) {
    return collection.updateOne(
      { _id: id },
      { $addToSet: { favorites: productId } },
    );
  }

  async function removeFromFavorites(id, productId) {
    return collection.updateOne(
      { _id: id },
      { $pull: { favorites: productId } },
    );
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
    addToFavorites,
    removeFromFavorites,
    getFavorites,
    deleteById,
    findAll,
  };
}

module.exports = createUserModel;
