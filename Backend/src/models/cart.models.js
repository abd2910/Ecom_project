import mongoose from 'mongoose';

const CartSchema=new mongoose.Schema({

      product:{type:mongoose.Schema.ObjectId,ref:"Product"},
      category:{type:mongoose.Schema.Types.ObjectId,ref:"User"}

})