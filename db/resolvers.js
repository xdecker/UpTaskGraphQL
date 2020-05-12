const Usuario = require('../models/Usuario');
const Proyecto =  require('../models/Proyecto');
const Tarea = require('../models/Tarea');

const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({path: 'variables.env'});

//CREA Y FIRMA JSONWEBTOKEN
const crearToken = (usuario, secreta, expiresIn) => {
    //console.log(usuario);
    const {id, email, nombre} = usuario;

    return jwt.sign({id, email, nombre}, secreta, {expiresIn});
};


//funciones que necesitan los typedefs DEBEN ESTAR EN AMBOS
const resolvers = {
    //CONSULTAS /GET
    Query: {
        //solo se veran los proyectos del usuario autenticado
        obtenerProyectos: async (_, {}, ctx) => {
            const proyectos = await Proyecto.find({creador: ctx.usuario.id});
            return proyectos;
        },

        obtenerTareas: async (_, {input}, ctx) => {
            const tareas = await Tarea.find({creador: ctx.usuario.id}).where('proyecto').equals(input.proyecto);
            return tareas;
        },

    },//fin querys


    //ACTUALIZACIONES,  CREACIONES Y ELIMINAR
    Mutation: {
        //parametros: 1ero datos del padre (resultados previos), 2do argumento pasados,
        // 3ro: context objeto que se comparte en todos los resolvers, 4to es info del query
        crearUsuario: async (_, {input}) => {
            //console.log(input);

            const {email, password} = input;
            const existeUsuario = await Usuario.findOne({email});
            //console.log(existeUsuario);
            //si el usuario existe
            if(existeUsuario){
                throw new Error('El usuario ya esta registrado');
            }

            try {

                //hashear password
                const salt = await bcryptjs.genSalt(10);
                input.password = await bcryptjs.hash(password, salt);


                //registrar nuevo usuario
                const nuevoUsuario = new Usuario(input);
                //console.log(nuevoUsuario);

                //guardar en la BD
                nuevoUsuario.save();
                return 'Usuario creado con éxito'

            } catch (error) {
                console.log(error);
            }

        },

        autenticarUsuario: async (_, {input}) => {
            const {email, password} = input;

            //si el usuario existe
            const existeUsuario = await Usuario.findOne({email});
            //console.log(existeUsuario);
            //si el usuario existe
            if(!existeUsuario){
                throw new Error('El usuario no existe');
            }


            //revisar si el password es correcto
            const passwordConfirm = await bcryptjs.compare(password, existeUsuario.password);
            //console.log(passwordConfirm);

            if(!passwordConfirm){
                throw new Error('Password incorrecto');
            }

            //dar acceso al app
            return {
                //parametros: usuario, firma, duracion
                token: crearToken(existeUsuario, process.env.SECRETA, '4hr')
            };
        }, //fin autenticausuario

        nuevoProyecto: async (_, {input}, ctx) => {



            try{
                const proyecto = new Proyecto(input);

                //colocar creador(usuario logeado)
                proyecto.creador = ctx.usuario.id;

                //almacenarlo en BD
                const resultado = await proyecto.save();

                return resultado;

            } catch(error) {
                console.log(error);
            }

        },

        actualizarProyecto: async (_, {id, input}, ctx) => {
            //revisar si existe proyecto
            let proyecto = await Proyecto.findById(id);
            if(!proyecto){
                throw new Error('Proyecto no encontrado');
            }
            //verificar creador(solo el debe modificarlo)
            if(proyecto.creador.toString() !== ctx.usuario.id){
                throw new Error('Este proyecto no pertenece al usuario');
            }
            //actualizar proyecto
            proyecto = await Proyecto.findOneAndUpdate({_id: id}, input, {new: true});
            return proyecto;
        },

        eliminarProyecto: async (_, {id}, ctx) => {

            //revisar si existe proyecto
            let proyecto = await Proyecto.findById(id);
            if(!proyecto){
                throw new Error('Proyecto no encontrado');
            }
            //verificar creador(solo el puede eliminarlo)
            if(proyecto.creador.toString() !== ctx.usuario.id){
                throw new Error('Este proyecto no pertenece al usuario');
            }
            //eliminar proyecto
            await Proyecto.findOneAndDelete({_id: id});
            return "Proyecto eliminado";

        },//fin eliminarProyecto


        crearTarea : async (_, {input}, ctx) => {
            try{
                const tarea = new Tarea(input);
                tarea.creador = ctx.usuario.id;
                const resultado = await tarea.save();

                return resultado;

            }  catch (error) {
                console.log(error);
            }
        },

        actualizarTarea: async (_, {id, input, estado}, ctx) => {

            //revisar si existe la tarea
            let tarea = await Tarea.findById(id);
            if(!tarea){
                throw new Error ('Tarea no encontrada');
            }
            //verificar creador(solo el puede modificarlo)
            if(tarea.creador.toString() !== ctx.usuario.id){
                throw new Error('Esta tarea no pertenece al usuario');
            }

            //asignar estado
            input.estado = estado;

            //actualizar tarea
            tarea = await Tarea.findOneAndUpdate({_id: id}, input, {new: true});

            return tarea;


        },

        eliminarTarea: async (_, {id}, ctx) => {
            //revisar si existe la tarea
            let tarea = await Tarea.findById(id);
            if(!tarea){
                throw new Error ('Tarea no encontrada');
            }
            //verificar creador(solo el puede eliminarlo)
            if(tarea.creador.toString() !== ctx.usuario.id){
                throw new Error('Esta tarea no pertenece al usuario');
            }

            //ELIMINAR
            await Tarea.findOneAndDelete({_id: id});

            return "Tarea Eliminada";
        }





    } //fin mutations
} //FIN RESOLVERS

module.exports = resolvers;
