/*
  If `scheme_id` does not exist in the database:

  status 404
  {
    "message": "scheme with scheme_id <actual id> not found"
  }
// */
const db = require('../../data/db-config');

const checkSchemeId = async (req, res, next) => {
  try{
    const id = await db('schemes as s').where('s.scheme_id',req.params.scheme_id).first()
    if(!id){
      next({status:404,"message": `scheme with scheme_id ${req.params.scheme_id} not found`})
    }
      next()    
  }
  catch(err){
    next(err)
  }
}

/*
  If `scheme_name` is missing, empty string or not a string:

  status 400
  {
    "message": "invalid scheme_name"
  }
*/

const validateScheme = (req, res, next) => {
  const {scheme_name} = req.body;
  if(scheme_name === undefined || scheme_name === '' || typeof scheme_name !== 'string'){
    next({status:400,message:"invalid scheme_name"})
  }
  next()
}

/*
  If `instructions` is missing, empty string or not a string, or
  if `step_number` is not a number or is smaller than one:

  status 400
  {
    "message": "invalid step"
  }
*/
const validateStep = (req, res, next) => {
  const {step_number,instructions} = req.body;
  if(instructions === undefined || instructions === '' || typeof instructions !== 'string' || typeof step_number !== 'number' || isNaN(step_number) || step_number < 1 ){
    next({status:400,message:"invalid step"})
  }
  next()
}

module.exports = {
  checkSchemeId,
  validateScheme,
  validateStep,
}
