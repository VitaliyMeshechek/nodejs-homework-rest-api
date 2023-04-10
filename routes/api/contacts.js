const express = require('express')
const Joi = require('joi');

const router = express.Router()

const contacts = require('..//..//models/contacts')

const {HttpError} = require('..//..//helpers');

const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'ukr'] } }).required(),
  phone: Joi.string().required()
})

const updateSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'ukr'] } }),
  phone: Joi.string()
})


router.get('/', async (req, res, next) => {
  try {
    const result = await contacts.listContacts();
    res.json(result)
  } 
  catch (error) {
    next(error);
  }
});


router.get('/:contactId', async (req, res, next) => {
  try {
    const {contactId} = req.params;
    const result = await contacts.getContactById(contactId);
    if(!result) {
      throw HttpError(404, "Not found");
    }
    res.json(result);
    }
  catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const {error} = schema.validate(req.body);
    if(error) {
      throw HttpError(400, "missing required name field");
    }
    const result = await contacts.addContact(req.body);
    res.status(201).json(result);
  }
  catch (error) {
    next(error);
  }
});
 

router.put('/:contactId', async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
    } = req.body;
    const {contactId} = req.params;
    
    if(!name && !email && !phone) {
      throw HttpError(400, "missing fields");
    }
      const result = await contacts.updateContact(contactId, req.body);

    if(email) {
    const {error} = updateSchema.validate(req.body);
    if(error) {
      throw HttpError(400, "must be a valid email");
    }
    }
    
    if(!result) {
      throw HttpError(404, "Not found");
    }
    res.json(result);
  }
  catch (error) {
    next(error);
  }
});


router.delete('/:contactId', async (req, res, next) => {
  try {
    const {contactId} = req.params;
    const result = await contacts.removeContact(contactId);
    if(!result) {
      throw HttpError(404, "Not found");
    }
    // res.status(204).send();
    res.json({message: 'Delete success'}).json(result);
  }
  catch (error) {
    next(error);
  }
});


module.exports = router
