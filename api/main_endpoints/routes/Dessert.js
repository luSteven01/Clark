const express = require('express');
const router = express.Router();
const Dessert = require('../models/Dessert');

const {
    OK,
    BAD_REQUEST,
    NOT_FOUND
} = require('../../util/constants').STATUS_CODES;

router.post('/createDessert', (req, res) => {
    const { calories } = req.body;
    const numberSent = !Number.isNaN(Number(calories));

    const newEvent = new Dessert({
        name: req.body.name,
        description: req.body.description,
        calories: numberSent ? Number(calories) : undefined,
    });

    Dessert.create(newEvent)
        .then((post) => {
            return res.json(post);
        })
        .catch (
            (error) => res.sendStatus(BAD_REQUEST)
        );
});

router.get('/getDesserts', (req, res) => {
    Dessert.find()
        .then(items => 
            res.status(OK).send(items)
        )
        .catch(error => {
            res.sendStatus(BAD_REQUEST)
        });     
});

router.post('/editDessert', (req, res) => {
    const {
        name,
        description,
        calories,
        _id,
    } = req.body;
    Dessert.findOne({_id})
        .then(Dessert => {
            Dessert.name = name || Dessert.name;
            Dessert.description = description || Dessert.description;
            Dessert.calories = calories || Dessert.calories;
            Dessert.save()
                .then(() => {
                    res.sendStatus(OK);
                })
                .catch(() => {
                    res.sendStatus(BAD_REQUEST);
                })
        })
        .catch(() => {
            res.sendStatus(NOT_FOUND);
        })
});

router.post('/deleteDessert', (req, res) => {
    Dessert.deleteOne({ _id: req.body._id })
        .then (result => {
            if (result.n < 1) {
                res.sendStatus(NOT_FOUND);
            } else {
                res.sendStatus(OK);
            }
        })
        .catch (() => {
            res.send(BAD_REQUEST);
        });
});

module.exports = router;
