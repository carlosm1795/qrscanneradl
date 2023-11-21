import clientPromise from "../../lib/mongodb";

export default async (req, res) => {
    try {
        console.log(req.body)
        const client = await clientPromise;

      let DataToInsert = [];
      let actividad = req.body.actividad;
      actividad.Fecha = new Date(actividad.Fecha)
      req.body.usuarios.forEach(persona => {
        DataToInsert.push({
          ...persona,
          actividad,
          
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