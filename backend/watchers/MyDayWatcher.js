import mongoose from "mongoose";

export const watchMyDayDeletions = (io) => {
  const changeStream = mongoose.connection.collection("mydays").watch();

  changeStream.on("change", (change) => {
    if (change.operationType === "delete") {
      const deletedId = change.documentKey._id;
      io.emit("mydayDeleted", deletedId);
    }
  });
};
