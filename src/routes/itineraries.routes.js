const express = require('express');
const router = express.Router();
const itineraries = require('../controllers/itineraries.controller');
const auth = require('../middleware/auth.middleware');
const { cacheItinerary } = require('../middleware/cache.middleware');
const { createItineraryValidator } = require('../validation/itinerary.validation');

/**
 * @swagger
 * tags:
 *   - name: Itineraries
 *     description: Manage travel itineraries (CRUD + sharing)
 *
 * components:
 *   schemas:
 *     Activity:
 *       type: object
 *       properties:
 *         time:
 *           type: string
 *           example: "10:00 AM"
 *         description:
 *           type: string
 *           example: "Visit to Mysore Palace"
 *         location:
 *           type: string
 *           example: "Mysore"
 *
 *     Itinerary:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "670a2ccf4a98dc2a67cbe7f9"
 *         user:
 *           type: string
 *           example: "6529dfd81d3f11d29211e77a"
 *         title:
 *           type: string
 *           example: "Business Trip to Bangalore"
 *         startDate:
 *           type: string
 *           format: date
 *           example: "2025-10-15"
 *         endDate:
 *           type: string
 *           format: date
 *           example: "2025-10-20"
 *         destination:
 *           type: string
 *           example: "Bangalore"
 *         activities:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Activity'
 *         shareableId:
 *           type: string
 *           example: "e5a7f9b2-1c2e-4af9-b1f4-cb8d12345678"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-10-12T10:45:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-10-12T11:10:00.000Z"
 *
 *     CreateItineraryInput:
 *       type: object
 *       required:
 *         - title
 *         - startDate
 *         - endDate
 *         - destination
 *       properties:
 *         title:
 *           type: string
 *           example: "Weekend getaway to Goa"
 *         startDate:
 *           type: string
 *           format: date
 *           example: "2025-11-01"
 *         endDate:
 *           type: string
 *           format: date
 *           example: "2025-11-03"
 *         destination:
 *           type: string
 *           example: "Goa"
 *         activities:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Activity'
 *
 *     UpdateItineraryInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Updated Business Trip to Bangalore"
 *         startDate:
 *           type: string
 *           format: date
 *           example: "2025-10-16"
 *         endDate:
 *           type: string
 *           format: date
 *           example: "2025-10-21"
 *         destination:
 *           type: string
 *           example: "Mysore"
 *         activities:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Activity'
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Itinerary not found"
 */

/**
 * @swagger
 * /api/itineraries:
 *   post:
 *     summary: Create a new itinerary
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateItineraryInput'
 *     responses:
 *       201:
 *         description: Itinerary created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Itinerary'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', auth, createItineraryValidator, itineraries.createItinerary);

/**
 * @swagger
 * /api/itineraries:
 *   get:
 *     summary: Get all itineraries for the logged-in user
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of itineraries per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum:
 *             - createdAt:asc
 *             - createdAt:desc
 *             - startDate:asc
 *             - startDate:desc
 *             - title:asc
 *             - title:desc
 *           default: createdAt:desc
 *         description: >
 *           Sort itineraries by field and order.
 *           Use `:asc` or `:desc` to specify sort order (defaults to `desc` if omitted).
 *           Example: `createdAt:asc` or `title:desc`
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         description: Filter itineraries by destination (case-insensitive)
 *     responses:
 *       200:
 *         description: List of itineraries with optional pagination, sorting, and filtering
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 total:
 *                   type: integer
 *                   example: 42
 *                 itineraries:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Itinerary'
 */
router.get('/', auth, itineraries.getItineraries);

/**
 * @swagger
 * /api/itineraries/{id}:
 *   get:
 *     summary: Get a single itinerary by ID (cached)
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "670a2ccf4a98dc2a67cbe7f9"
 *     responses:
 *       200:
 *         description: Itinerary fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Itinerary'
 *       404:
 *         description: Itinerary not found
 */
router.get('/:id', auth, cacheItinerary, itineraries.getItinerary);

/**
 * @swagger
 * /api/itineraries/{id}:
 *   put:
 *     summary: Update an itinerary
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "670a2ccf4a98dc2a67cbe7f9"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateItineraryInput'
 *     responses:
 *       200:
 *         description: Itinerary updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Itinerary'
 *       404:
 *         description: Itinerary not found
 */
router.put('/:id', auth, itineraries.updateItinerary);

/**
 * @swagger
 * /api/itineraries/{id}:
 *   delete:
 *     summary: Delete an itinerary
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Itinerary deleted successfully
 *       404:
 *         description: Itinerary not found
 */
router.delete('/:id', auth, itineraries.deleteItinerary);

/**
 * @swagger
 * /api/itineraries/share/{shareableId}:
 *   get:
 *     summary: Publicly fetch a shared itinerary by its shareable ID (no auth required)
 *     tags: [Itineraries]
 *     parameters:
 *       - in: path
 *         name: shareableId
 *         required: true
 *         schema:
 *           type: string
 *           example: "e5a7f9b2-1c2e-4af9-b1f4-cb8d12345678"
 *     responses:
 *       200:
 *         description: Shared itinerary fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Itinerary'
 *       404:
 *         description: Shared itinerary not found
 */
router.get('/share/:shareableId', itineraries.getSharedItinerary);

module.exports = router;
