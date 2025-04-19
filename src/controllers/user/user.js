
const createUser = async (req, res) => {
    const {name,user, email, password, rol} = req.body;
    const newUser = new Usuario({
        name,
        user,
        email,
        password: await Usuario.encryptPassword(password),
        rol
    });
    await newUser.save();
    res.json({message: 'User created'});
    }
