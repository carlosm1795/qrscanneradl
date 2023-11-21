import clientPromise from "../../lib/mongodb";

export default async (req, res) => {
    try {
        console.log(req.body)
        const client = await clientPromise;

      let DataToInsert = [];
      const actividad = req.body.actividad;
      req.body.usuarios.forEach(persona => {
        DataToInsert.push({
          ...persona,
          actividad
        })

      })

      const db = client.db("AsistenciaADL");
      const result = await db
            .collection("Registros")
            .insertMany(DataToInsert);
            res.json(result)
    } catch (e) {        
        res.json(e)
    }
 };