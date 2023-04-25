const { HttpError, ctrlWrapper } = require("..//helpers");

const { Contact } = require("..//models/contact");

const getAllContacts = async (req, res) => {
  const {_id: owner} = req.user;
  const {page, limit} = req.query;
  const skip = (page - 1) * limit;
  const result = await Contact.find({owner}, "-createdAt -updatedAt", {skip, limit});
  res.json(result);
};

const getContactById = async (req, res) => {
  const { contactId } = req.params;
  //  const result = await Contact.findOne({_id: contactId});
  const result = await Contact.findById(contactId);
  if (!result) {
    res.status(404, "Not found");
  }
  res.json(result);
};

const addContact = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw HttpError(400, "missing required name field");
  }
  const {_id: owner} = req.user;
  const result = await Contact.create({...req.body, owner});
  res.status(201).json(result);
};

const updateContact = async (req, res) => {
  const { name, email, phone } = req.body;
  const { contactId } = req.params;

  if (!name && !email && !phone) {
    throw HttpError(400, "missing fields");
  }
  const result = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });

  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json(result);
};

const updateStatusContact = async (req, res) => {
  const { favorite } = req.body;
  const { contactId } = req.params;

  if (!favorite) {
    res.status(400, "missing field favorite");
  }
  const result = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });

  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json(result);
};

const deleteContact = async (req, res) => {
  const { contactId } = req.params;
  const result = await Contact.findByIdAndDelete(contactId);
  if (!result) {
    throw HttpError(404, "Not found");
  }
  // res.status(204).send();
  res.json({ message: "Delete success" }).json(result);
};

module.exports = {
  getAllContacts: ctrlWrapper(getAllContacts),
  getContactById: ctrlWrapper(getContactById),
  addContact: ctrlWrapper(addContact),
  updateContact: ctrlWrapper(updateContact),
  updateStatusContact: ctrlWrapper(updateStatusContact),
  deleteContact: ctrlWrapper(deleteContact),
};
