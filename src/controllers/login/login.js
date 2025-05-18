const User = require('../../moduls/user'); // Ajusta la ruta si es necesario
const bcrypt = require('bcryptjs'); // Asegúrate de importar bcrypt
const jwt = require('jsonwebtoken'); // Importa JWT
require('dotenv').config(); // Cargar variables de entorno

exports.login = async (req, res)=>{
    try {
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({msg: "Por favor ingresa todos los campos"})
        }

        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({msg: "El usuario no existe"})
        }

        const passwordMatch = await  User.findOne({password})

        if(!passwordMatch){
            return res.status(400).json({msg: "Contraseña incorrecta"})
        }
        
        // const isMatch = await bcrypt.compare(password, user.password)
        // if(!isMatch){
        //     return res.status(400).json({msg: "Contraseña incorrecta"})
        // }

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: 3600
        }, (err, token)=>{
            if(err) throw err;
            res.json({token})

        }
        )

    } catch (error) {
        console.log(error)
    }
}