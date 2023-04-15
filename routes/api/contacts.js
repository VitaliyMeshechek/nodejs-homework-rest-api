const express = require('express');

const router = express.Router();

const ctrl = require('..//..//controllers/contacts');

const {schemas} = require('..//..//models/contact');

const {validateBody, isValidId} = require('../../middlewares');


router.get('/', ctrl.getAllContacts);

router.get('/:contactId', isValidId, ctrl.getContactById);

router.post('/', validateBody(schemas.addSchema), ctrl.addContact);
 
router.put('/:contactId', isValidId, validateBody(schemas.updateSchema), ctrl.updateContact);

router.patch('/:contactId/favorite', isValidId, validateBody(schemas.updateFavoriteSchema), ctrl.updateStatusContact);

router.delete('/:contactId', isValidId, ctrl.deleteContact);


module.exports = router;
