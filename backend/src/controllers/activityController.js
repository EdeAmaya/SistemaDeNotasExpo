const activityController = {};

import activityModel from "../models/Activity.js"; // Modelo

// Select
activityController.getActivities = async (req,res) => {
  const activities = await activityModel.find()
  res.json(activities)
};

// Insert
activityController.insertActivity = async (req,res) =>{
    const{title, startDate, endDate} = req.body;
    const newActivity = new activityModel({title, startDate, endDate})
    await newActivity.save()
    res.json({message: "activity saved"})
};

// Delete

activityController.deleteActivity = async(req,res) =>{
    await activityModel.findByIdAndDelete(req.params.id);
    res.json({message: "activity deleted"})
};

// Update

activityController.updateActivity = async(req,res) =>{
    const {title, startDate, endDate} = req.body;
    const updateActivity = await activityModel.findByIdAndUpdate(req.params.id,{title, startDate, endDate},{new: true})
    res.json({message: "activity updated"})
}

export default activityController;