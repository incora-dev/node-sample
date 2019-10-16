const express = require('express');
const helpersMiddleware = require('../helpers/middleware');
const helpersValidation = require('../helpers/validation');
const controllersUsers = require('../controllers/users');
const controllersPayments = require('../controllers/payments');
const controllersAppointments = require('../controllers/appointments');
const helpersTwilio = require('../helpers/twilio');
const { catchErrors } = require('../helpers/error');

const router = express.Router();

router
    .route('/')
    /**
     * @api {post} /appointments/ Create appointment
     * @apiDescription Create an appointment
     * @apiGroup Appointments
     *
     * @apiParam {string} [session_hash]
     * @apiParam {string} [user_hash]
     * @apiParam {timestamp} start
     * @apiParam {string} users_experts_lengths_id
     * @apiParam {string} currency_code
     * @apiParam {string{1-1000}} [client_message]
     *
     * @apiSuccess (200) {string} id Id of inserted appointment
     */
    .post(
        catchErrors(helpersValidation.checkForUser('body')),
        helpersMiddleware.applicationHash('private', true),
        catchErrors(helpersValidation.appointments.post),
        catchErrors(helpersMiddleware.getUserByHash),
        helpersMiddleware.isUserSet,
        catchErrors(controllersAppointments.isAppointmentValid),
        controllersAppointments.makeAppointment,
    )

    /**
     * @api {put} /appointments/ Update apointment status
     * @apiDescription Update apointment status
     * @apiGroup Appointments
     *
     * @apiHeader {string} [application_hash_private]
     *
     * @apiParam {string} [session_hash]
     * @apiParam {string} [user_hash]
     * @apiParam {int} appointment_id
     * @apiParam {int} status
     * @apiParam {string} [reason]
     *
     */
    .put(
        catchErrors(helpersValidation.checkForUser('body')),
        helpersMiddleware.applicationHash('private', true),
        catchErrors(helpersValidation.appointments.put),
        catchErrors(helpersMiddleware.getUserByHash),
        helpersMiddleware.isUserSet,
        controllersAppointments.updateAppointmentStatus,
    )

    /**
     * @api {get} /appointments/ Get apointments
     * @apiDescription Get apointments
     * @apiGroup Appointments
     *
     * @apiHeader {string} [application_hash_private]
     *
     * @apiParam {string} [session_hash]
     * @apiParam {string} [user_hash]
     * @apiParam {int} status
     * @apiParam {int} status_type
     * @apiParam {int} is_offiine
     * @apiParam {timestamp} start_from
     * @apiParam {timestamp} start_to
     *
     * @apiSuccess (200) {array} appointments Array of found appointments
     */
    .get(
        catchErrors(helpersValidation.checkForUser('query')),
        helpersMiddleware.applicationHash('private', true),
        catchErrors(helpersValidation.appointments.get),
        catchErrors(helpersMiddleware.getUserByHash),
        helpersMiddleware.isUserSet,
        catchErrors(controllersAppointments.getAppointments),
    );

router
    .route('/get-invoice')
    /**
     * @api {get} /appointments/twilio/get-token Get twilio token
     * @apiDescription Get twilio token
     * @apiGroup Appointments
     *
     *
     * @apiSuccess (200) {token} twilio token
     */
    .get(
        catchErrors(helpersMiddleware.getUserByUserHash()),
        helpersMiddleware.isUserSet,
        controllersAppointments.getInvoice,
    );

router
    .route('/guest/')
    /**
     * @api {post} /appointments/guest/ Create appointment as a guest
     * @apiDescription Create an appointment
     * @apiGroup Appointments
     *
     * @apiParam {string} [session_hash]
     * @apiParam {string} [user_hash]
     * @apiParam {timestamp} start
     * @apiParam {string} users_experts_lengths_id
     * @apiParam {string} currency_code
     * @apiParam {string{1-1000}} [client_message]
     *
     * @apiSuccess (200) {string} id Id of inserted appointment
     */
    .post(
        helpersMiddleware.applicationHash('both', true),
        helpersMiddleware.applicationHash('private', true),
        catchErrors(helpersValidation.appointments.post),
        catchErrors(helpersMiddleware.getGuestByHash),
        helpersMiddleware.isGuestSet,
        catchErrors(controllersAppointments.isAppointmentValid),
        controllersAppointments.makeAppointment,
    )
    /**
     * @api {put} /appointments/ Update apointment status
     * @apiDescription Update apointment status
     * @apiGroup Appointments
     *
     * @apiHeader {string} [application_hash_private]
     *
     * @apiParam {string} [session_hash]
     * @apiParam {string} [user_hash]
     * @apiParam {int} appointment_id
     * @apiParam {int} status
     * @apiParam {string} [reason]
     *
     */
    .put(
        helpersMiddleware.applicationHash('both', true),
        helpersMiddleware.applicationHash('private', true),
        catchErrors(helpersValidation.appointments.put),
        catchErrors(helpersMiddleware.getGuestByHash),
        helpersMiddleware.isGuestSet,
        controllersAppointments.updateAppointmentStatus,
    )
    /**
     * @api {get} /appointments/ Get apointments
     * @apiDescription Get apointments
     * @apiGroup Appointments
     *
     * @apiHeader {string} [application_hash_private]
     *
     * @apiParam {string} [session_hash]
     * @apiParam {string} [user_hash]
     * @apiParam {int} status
     * @apiParam {int} status_type
     * @apiParam {int} is_offiine
     * @apiParam {timestamp} start_from
     * @apiParam {timestamp} start_to
     *
     * @apiSuccess (200) {array} appointments Array of found appointments
     */
    .get(
        helpersMiddleware.applicationHash('private', true),
        catchErrors(helpersValidation.appointments.get),
        catchErrors(helpersMiddleware.getGuestByHash),
        helpersMiddleware.isGuestSet,
        catchErrors(controllersAppointments.getGuestAppointments),
    );