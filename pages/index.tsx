import Head from 'next/head'
import { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { Persona } from "../models/user";
import { QrScanner } from '@yudiel/react-qr-scanner';
import es from 'date-fns/locale/es';
import { Actividad } from "../models/actividad";
import clientPromise from '../lib/mongodb'
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import { SimpleGrid, Box } from '@chakra-ui/react'
import { Tabs, TabList, TabPanels, Tab, TabPanel, Input, useToast } from '@chakra-ui/react'
import { ChakraProvider, Select } from '@chakra-ui/react'
import { Button } from '@chakra-ui/react'
import {
  ListItem,
  UnorderedList,
} from '@chakra-ui/react'

type ConnectionStatus = {
  isConnected: boolean
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}



export const getServerSideProps: GetServerSideProps<
  ConnectionStatus
> = async () => {
  try {
    await clientPromise
    // `await clientPromise` will use the default database passed in the MONGODB_URI
    // However you can use another database (e.g. myDatabase) by replacing the `await clientPromise` with the following code:
    //
    // `const client = await clientPromise`
    // `const db = client.db("myDatabase")`
    //
    // Then you can execute queries against your database like so:
    // db.find({}) or any of the MongoDB Node Driver commands

    return {
      props: { isConnected: true },
    }
  } catch (e) {
    console.error(e)
    return {
      props: { isConnected: false },
    }
  }
}

export default function Home({
  isConnected,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const toast = useToast()
  const id = 'test-toast'
  const [usuarios, setUsuarios] = useState<Array<Persona>>([]);
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState(0);
  const [actividad, setActividad] = useState<Actividad>({
    Lugar: "",
    Actividad: "",
    Notas: "",
    Fecha: new Date(),
  })

  const onNewScanResult = (decodedText: any) => {
    console.log(decodedText);
    try {
      const data: any = decodedText.split("-");
      const newPersona: Persona = {
        Id: data[1].trim(),
        Nombre: data[0].trim()
      }
      let found = usuarios.find((usuario) => usuario.Id == newPersona.Id);
      if (found === undefined) {

        const updateUsers = [
          ...usuarios,
          newPersona
        ]
        console.log(updateUsers);
        setUsuarios(updateUsers)
        setValue("");
        setMessage(`${newPersona.Nombre} registrado`)
      } else {
        setMessage("Este usuario ya estaba registrado")
      }
    } catch (error) {
      console.log(error)
    }
    // handle decoded results here
  };

  const RemoveUser = (id: string) => {
    const newData = usuarios.filter((usuario) => usuario.Id !== id);
    console.log(newData);
    setUsuarios(newData);
  }

  const ResetSettings = () => {
    setUsuarios([])
    setActividad({
      Lugar: "",
      Actividad: "",
      Notas: "",
      Fecha: new Date(),
    })
  }

  const InsertDataIntoDB = async () => {
    try {    
      axios
        .post("https://registro.grootprojects.com/api/registros", {
          usuarios,
          actividad,      
        })
        .then((response) => {
          console.log(response)
          if (!toast.isActive(id)) {
            toast({
              id,
              title: 'Usuarios Registrados',
              duration: 2000,
              position: "top"
            })
          }
          ResetSettings();
        });
    } catch (error) {
      console.log(error)
    }
  }

  const handleChangeActividad = (event: ChangeEvent<HTMLSelectElement>) => {
    setActividad((state) => ({
      ...state,
      Actividad: event.target.value
    }))
  };
  const handleChangeLugar = (event: ChangeEvent<HTMLSelectElement>) => {
    console.log(event.target.value);
    setActividad((state) => ({
      ...state,
      Lugar: event.target.value
    }))
  };

  return (
    <ChakraProvider>
      <div>
        {isConnected ? (
          <h2 className="subtitle">You are connected to MongoDB</h2>
        ) : (
          <h2 className="subtitle">
            You are NOT connected to MongoDB. Check the <code>README.md</code>{' '}
            for instructions.
          </h2>
        )}
        <SimpleGrid columns={1} spacing={10}>

          <QrScanner
            onDecode={(result) => onNewScanResult(result)}
            onError={(error) => console.log(error?.message)}
          />

          <Box height='80px'>
            <Tabs>
              <TabList>
                <Tab>Lista de Personas {usuarios.length}</Tab>
                <Tab>Dato Actividad</Tab>

              </TabList>

              <TabPanels>
                <TabPanel>
                  <UnorderedList>
                    {
                      usuarios.map(user =>
                        <ListItem key={user.Id}>
                          {user.Nombre}
                          <Button colorScheme='teal' size='xs' onClick={() => RemoveUser(user.Id)}>
                            X
                          </Button>
                        </ListItem>
                      )
                    }
                  </UnorderedList>
                </TabPanel>
                <TabPanel>
                  <Select placeholder='Lugar' onChange={(e) => handleChangeLugar(e)}>
                    <option value='Tibas'>Tibas</option>
                    <option value='Cartago'>Cartago</option>
                  </Select>
                  <Select placeholder='Actividad' onChange={(e) => handleChangeActividad(e)}>
                    <option value='Reunion Miercoles Mañana'>Reunion Miercoles Mañana</option>
                    <option value='Reunion Miercoles Tarde'>Reunion Miercoles Tarde</option>
                    <option value='Reunion Domingo Mañana'>Reunion Domingo Mañana</option>
                    <option value='Reunion Domingo Tarde'>Reunion Domingo Tarde</option>
                    <option value='Contemplacion'>Contemplacion</option>
                    <option value='Mision'>Mision</option>
                  </Select>
                  <Input
                    placeholder="Fecha"
                    size="md"
                    type="date"                    
                    onChange={(e) => setActividad((state) => ({ ...state, Fecha: new Date(e.target.value) }))}
                  />
                  <Input
                    placeholder="Notas"
                    size="md"
                    type="text"
                    onChange={(e) => setActividad((state) => ({ ...state, Notas: e.target.value }))}
                  />
                  <Button colorScheme='teal' onClick={InsertDataIntoDB} >Registrar</Button>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>

        </SimpleGrid>
      </div>
    </ChakraProvider>
  )
}
