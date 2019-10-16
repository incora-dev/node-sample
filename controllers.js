const moment = require('moment-timezone');
const i18n = require('i18n');
const winston = require('winston');
const modelsUsers = require('../models/users');
const modelsGuests = require('../models/guests');
const modelsUsersLengths = require('../models/usersLengths');
const modelsAppointments = require('../models/appointments');
const modelsPayments = require('../models/payments');
const modelsSystem = require('../models/system');
const controllerPayments = require('../controllers/payments');

exports.createTwilioToken = async (req, res) => {
    try {
        const token = await helpersTwilio.generateCallToken();
        res.send({ token });
    } catch (error) {
        res.send(error);
    }
};

exports.twilioCallForward = async (req, res) => {
    const { phoneNumber } = req.body;
    const callerId = process.env.TWILIO_CALLER_ID;
    try {
        const callResponse = await helpersTwilio.makePrivateCall(callerId, phoneNumber);
        res.send(callResponse);
    } catch (error) {
        res.send(error);
    }
};

exports.getAppointments = async (req, res) => {
    if (!req.user) throwError('User not found', 400);
    const status = req.query.status || req.query.status_type ? {
        number: req.query.status || req.query.status_type,
        exact: typeof req.query.status === 'undefined',
    } : undefined;

    const appointments = await modelsAppointments.getAppointments({
        id: req.query.appointment_id,
        status: status,
        startFrom: req.query.start_from,
        startTo: req.query.start_to,
        user: req.user,
    });
    res.status(200).json(appointments);
};

exports.getTwilioToken = async (req, res) => {
    try {
        const [appointment] = await modelsAppointments.getAppointments({
            id: req.query.appointment_id,
        }, true);
        const now = moment();
        const start = moment(appointment.start);
        const allowedFrom = moment(start)
            .subtract(process.env.APPOINTMENT_MINUTES_BEFORE_START_TO_BEGIN, 'minutes');
        const allowedTo = moment(start)
            .add(process.env.APPOINTMENT_MINUTES_AFTER_START_TO_FINISH, 'minutes');
        if (now.isBefore(allowedFrom) || now.isAfter(allowedTo)) {
            throwError('Appointment is not in valid time range to get token', 400);
        }

        const isExpert = (req.user || {}).id === appointment.user_id_to;
        let twilioData = await helpersTwilio.getTokens(req.query.appointment_id, isExpert);
        const created = moment(twilioData.created, 'YYYY-MM-DD HH:mm:ss');
        if (created.clone().add(5, 'minutes').isBefore(moment())) {
            twilioData = await helpersTwilio.generateTokens(req.query.appointment_id);
            res.status(200).json({
                token: (isExpert ? twilioData.twilio_expert : twilioData.twilio_client),
                room: twilioData.twilio_room,
            });
        } else {
            res.status(200).json({
                token: twilioData.token,
                room: twilioData.room,
            });
        }
    } catch (err) {
        throw err;
    }
};
