const db = require("../../data/db-config")

async function find() { // EXERCISE A
  /*
    1A- Study the SQL query below running it in SQLite Studio against `data/schemes.db3`.
    What happens if we change from a LEFT join to an INNER join?
    Ans: The scheme(scheme_id:7) that has zero steps doesn't appear since the number of steps value is 'NULL' for that scheme 

      SELECT
          sc.*,
          count(st.step_id) as number_of_steps
      FROM schemes as sc
      LEFT JOIN steps as st
          ON sc.scheme_id = st.scheme_id
      GROUP BY sc.scheme_id
      ORDER BY sc.scheme_id ASC;

    2A- When you have a grasp on the query go ahead and build it in Knex.
    Return from this function the resulting dataset.
  */
  const rows = await db('schemes as sc')
      .leftJoin('steps as st','sc.scheme_id','st.scheme_id')
      .select('sc.*')
      .count('st.step_id as number_of_steps')
      .groupBy('sc.scheme_id')
      .orderBy('sc.scheme_id','asc')
  
  return rows;
}


async function findById(scheme_id) { // EXERCISE B
  /*
    1B- Study the SQL query below running it in SQLite Studio against `data/schemes.db3`:

      SELECT
          sc.scheme_name,
          st.*
      FROM schemes as sc
      LEFT JOIN steps as st
          ON sc.scheme_id = st.scheme_id
      WHERE sc.scheme_id = 1
      ORDER BY st.step_number ASC;

    2B- When you have a grasp on the query go ahead and build it in Knex
    making it parametric: instead of a literal `1` you should use `scheme_id`.

    3B- Test in Postman and see that the resulting data does not look like a scheme,
    but more like an array of steps each including scheme information:

      [
        {
          "scheme_id": 1,
          "scheme_name": "World Domination",
          "step_id": 2,
          "step_number": 1,
          "instructions": "solve prime number theory"
        },
        {
          "scheme_id": 1,
          "scheme_name": "World Domination",
          "step_id": 1,
          "step_number": 2,
          "instructions": "crack cyber security"
        },
        // etc
      ]

    4B- Using the array obtained and vanilla JavaScript, create an object with
    the structure below, for the case _when steps exist_ for a given `scheme_id`:

      {
        "scheme_id": 1,
        "scheme_name": "World Domination",
        "steps": [
          {
            "step_id": 2,
            "step_number": 1,
            "instructions": "solve prime number theory"
          },
          {
            "step_id": 1,
            "step_number": 2,
            "instructions": "crack cyber security"
          },
          // etc
        ]
      }

    5B- This is what the result should look like _if there are no steps_ for a `scheme_id`:

      {
        "scheme_id": 7,
        "scheme_name": "Have Fun!",
        "steps": []
      }

      
  */
  const rows = await db('schemes as sc')
      .leftJoin('steps as st','sc.scheme_id','st.scheme_id')
      .select('sc.scheme_name','st.*','sc.scheme_id')
      .where('sc.scheme_id',scheme_id)
      .orderBy('st.step_number', 'ASC')

  const result = {
    scheme_id: rows[0].scheme_id,
    scheme_name:rows[0].scheme_name,
    steps: rows.reduce((steps,step) => {
      if(!step.step_id) return steps

      const {step_id,step_number,instructions} = step
      return steps.concat({step_id,step_number,instructions})
    },[])
  }
  return result;
}

async function findSteps(scheme_id) { // EXERCISE C
  /*
    1C- Build a query in Knex that returns the following data.
    The steps should be sorted by step_number, and the array
    should be empty if there are no steps for the scheme:

      [
        {
          "step_id": 5,
          "step_number": 1,
          "instructions": "collect all the sheep in Scotland",
          "scheme_name": "Get Rich Quick"
        },
        {
          "step_id": 4,
          "step_number": 2,
          "instructions": "profit",
          "scheme_name": "Get Rich Quick"
        }
      ]
      SQL:
      SELECT
      st.step_id,st.step_number,st.instructions,sc.scheme_name
      FROM schemes as sc
      left join steps as st 
      on sc.scheme_id = st.scheme_id
      where sc.scheme_id = 1
      order by st.step_number;
  */
 const rows = await db('schemes as sc')
      .leftJoin('steps as st','sc.scheme_id','st.scheme_id')
      .where('sc.scheme_id',scheme_id)
      .select('st.step_id','st.step_number','st.instructions','sc.scheme_name')
      .orderBy('st.step_number','asc')

  if(!rows[0].step_number){
    return []
  }
  return rows;
 
}

async function add(scheme) { // EXERCISE D
  /*
    1D- This function creates a new scheme and resolves to _the newly created scheme_.
  */
 return db('schemes').insert(scheme)
  .then(([id]) => {
    return findById(id)
  })
}

async function addStep(scheme_id, step) { // EXERCISE E
  /*
    1E- This function adds a step to the scheme with the given `scheme_id`
    and resolves to _all the steps_ belonging to the given `scheme_id`,
    including the newly created one.
  */
 const result = await db('steps').insert({scheme_id,...step})
                  .then(() => {
                    return findSteps(scheme_id)
                  })

 return result
}

module.exports = {
  find,
  findById,
  findSteps,
  add,
  addStep,
}
