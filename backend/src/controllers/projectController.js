const projectController = {};

import projectModel from "../models/Project.js";

//Select

projectController.getProjects = async (req,res) => {
  const projects = await projectModel.find().populate("idLevel").populate("idSection")
  res.json(projects)
};

//Insert

projectController.insertProject = async (req,res) =>{
    const{projectId, projectName, googleSitesLink, idLevel, idSection, status} = req.body;
    const newProject = new projectModel({projectId, projectName, googleSitesLink, idLevel, idSection, status})
    await newProject.save()
    res.json({message: "project saved"})
};

//Delete

projectController.deleteProject = async(req,res) =>{
    await projectModel.findByIdAndDelete(req.params.id);
    res.json({message: "project deleted"})
};

//Update

projectController.updateProject = async(req,res) =>{
    const {projectId, projectName, googleSitesLink, idLevel, idSection, status} = req.body;
    const updateProject = await projectModel.findByIdAndUpdate(req.params.id,{projectId, projectName, googleSitesLink, idLevel, idSection, status},{new: true})
    res.json({message: "project updated"})
}

export default projectController;