const levelController = {};

import levelModel from "../models/Level.js";

//Select

levelController.getLevels = async (req,res) => {
  const levels = await levelModel.find()
  res.json(levels)
};

//Insert

levelController.insertLevel = async (req,res) =>{
    const{levelName, letterLevel} = req.body;
    const newLevel = new levelModel({levelName, letterLevel})
    await newLevel.save()
    res.json({message: "level saved"})
};

//Delete

levelController.deleteLevel = async(req,res) =>{
    await levelModel.findByIdAndDelete(req.params.id);
    res.json({message: "level deleted"})
};

//Update

levelController.updateLevel = async(req,res) =>{
    const {levelName, letterLevel} = req.body;
    const updateLevel = await levelModel.findByIdAndUpdate(req.params.id,{levelName, letterLevel},{new: true})
    res.json({message: "level updated"})
}

export default levelController;