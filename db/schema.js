const {gql} = require('apollo-server');

//type definitions para Apollo Server
const typeDefs = gql`

    type Proyecto {
        nombre: String,
        id: ID
    }
    
    type Tarea {
        nombre: String,
        id: ID,
        proyecto : String,
        estado: Boolean
    }
    
    type Query {
       obtenerProyectos: [Proyecto],
       obtenerTareas(input: ProyectoIDInput) : [Tarea]
        
    }
    
    type Token {
        token: String
    }
    
    
    input UsuarioInput {
        nombre: String!,
        email: String!,
        password: String!
    }
    
    input AutenticarInput {
        email: String!,
        password: String!
    }
    
    input ProyectoInput {
        nombre: String!
    }
    
    input TareaInput {
        nombre: String!
        proyecto: String
    }
    
    input ProyectoIDInput {
        proyecto: String!
    }
    
    
    
    
    type Mutation {
    
        #Usuario
        crearUsuario(input: UsuarioInput) : String
        autenticarUsuario(input: AutenticarInput) : Token
        
        #Proyectos
        nuevoProyecto(input: ProyectoInput) : Proyecto
        actualizarProyecto(id: ID!, input: ProyectoInput) : Proyecto
        eliminarProyecto(id: ID!) : String
        
        #Tareas
        crearTarea(input : TareaInput) : Tarea
        actualizarTarea(id: ID!,input : TareaInput, estado: Boolean) : Tarea
        eliminarTarea(id: ID!) : String
    }
`;

module.exports = typeDefs;
