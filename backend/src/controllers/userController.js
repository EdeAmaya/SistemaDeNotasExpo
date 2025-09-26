const userController = {};

import userModel from "../models/User.js";

//Select

userController.getUsers = async (req,res) => {
  const users = await userModel.find()
  res.json(users)
};

//Insert

userController.insertUser = async (req,res) =>{
    const{name, lastName, email, password, role, isVerified} = req.body;
    const newUser = new userModel({name, lastName, email, password, role, isVerified })
    await newUser.save()
    res.json({message: "user saved"})
};

//Delete

userController.deleteUser = async(req,res) =>{
    await userModel.findByIdAndDelete(req.params.id);
    res.json({message: "user deleted"})
};

//Update

userController.updateUser = async(req,res) =>{
    const {name, lastName, email, password, role, isVerified} = req.body;
    const updateUser = await userModel.findByIdAndUpdate(req.params.id,{name, lastName, email, password, role, isVerified},{new: true})
    res.json({message: "user updated"})
}

export default userController;