const { nanoid } = require('nanoid');

const fs = require('fs').promises;
const path = require('path');
const contactsPath = path.join(__dirname, './contacts.json');

const listContacts = async () => {
  const contactsList = await fs.readFile(contactsPath, "utf-8");
  return JSON.parse(contactsList);
}

const updateContact = async (contactId, body) => {
  const contacts = await listContacts();
  const contactIndex = contacts.findIndex(contact => contact.id === contactId);
  if (contactIndex === -1) {
     return null;
   }
  console.log('updateContact', contactIndex);
  contacts[contactIndex] = {...contacts[contactIndex],...body};
  fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2), "utf-8");
  return contacts[contactIndex];
}

const addContact = async (body) => {
  const contacts = await listContacts();
  const newContacts = {id: nanoid(21), ...body};
  contacts.push(newContacts);
  fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2), "utf-8");
  return newContacts;
} 

const getContactById = async (contactId) => {
  const contacts = await listContacts();
  const contact = contacts.find(contact => contact.id === contactId);
  return contact || null;
}

const removeContact = async (contactId) => {
  const contacts = await listContacts();
  const contactIndex = contacts.findIndex(contact => contact.id === contactId);
  if (contactIndex === -1) {
     return null;
   }
  console.log('removeContact', contactIndex);
  const result = contacts.splice(contactIndex, 1);
  fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2), "utf-8");
  return result;
}





module.exports = {
  listContacts,
  updateContact,
  addContact,
  getContactById,
  removeContact
}
