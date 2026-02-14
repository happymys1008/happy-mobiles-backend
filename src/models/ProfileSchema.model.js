import mongoose from "mongoose";

const profileSchemaModel = new mongoose.Schema(
  {
    schema: { type: Object, required: true }
  },
  { timestamps: true }
);

export default mongoose.model(
  "ProfileSchema",
  profileSchemaModel
);
