import  Sequelize, { Model } from "sequelize";


//getRecords, postRecord,getRecord,putRecord,deleteRecords,headRecord,deleteRecord,patchRecord


function valid(Model, payload) {
    return Object.entries(Model.tableAttributes).reduce((valid, [name, field]) => {
        if (valid
            && !field._autoGenerated
            && !field.primaryKey
            && field.allowNull === false
            && !payload[name]) {
                valid = false
            }
        return valid
    }, true)
}



async function getRecords(Model, req, res) {
    try {
        let records = await Model.findAll();
        if (records.length >0){
            res.status(200).json(records);
        }
        else{
            res.status(204).send();
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function postRecord(Model, req, res) {
    try {
        if (valid(Model, req.body)) {
            let record = await Model.create(req.body)
            res.status(201)
                .location(`http://${req.headers.host}${req.baseUrl}${req.url}${req.url.endsWith('/') ? '' : '/'}${record.id}`)
                .send()
            record.save()
        } else {
            res.status(400).send()
        }
    } catch (error) {
        res.status(500).json(error)
    }
}


async function getRecord(model, req, res) {
    try {
        let record = await model.findByPk(req.params.id);
        if (record) {
            res.status(200).json(record);
        } else {
            res.status(404).send();
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function putRecord(Model, req, res) {
    try {

        let record = await Model.findByPk(req.params.id);
        if (record) {
            if( valid(Model,req.body)){
                await record.update(req.body);
                res.status(204).send();
            }
        } else {
            res.status(404).send();
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


async function deleteRecord(Model, req, res) {
    try {
        let record = await Model.findByPk(req.params.id);
        if (record) {
            await record.destroy();
            res.status(204).send();
        }
        else{
            res.status(404).send();
        }
    } catch (error) {
        res.status(500).json(error);
    }
}


async function deleteRecords(Model, req, res) {
    try {
        await Model.truncate();
        res.status(204).end();
    } catch (error) {
        res.status(500).json(error);
    }
}


async function headRecord(Model, req, res) {
    try {
        res.status(await Model.findByPk(req.params.id) ? 204 : 404).send()
    } catch (error) {
        res.status(500).json(error)
    }
}

async function patchRecord(Model, req, res) {
    try {
        let record = await Model.findByPk(req.params.id);
        if (record) {

            Object.entries(req.body).forEach(([name, value]) => record[name] = value);
            await record.save();

            res.status(204).send();
        } else {
            res.status(404).send();
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}







export{getRecords, postRecord,getRecord,putRecord,deleteRecords,headRecord,deleteRecord,patchRecord};