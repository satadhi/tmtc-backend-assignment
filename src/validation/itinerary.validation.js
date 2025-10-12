const { Joi, celebrate } = require('celebrate');
exports.createItineraryValidator = celebrate({
  body: Joi.object({
    title: Joi.string().min(3).required(),
    destination: Joi.string().required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    activities: Joi.array()
      .items(
        Joi.object({
          time: Joi.string().required(),
          description: Joi.string().required(),
          location: Joi.string().required(),
        })
      )
      .default([]),
  }),
});
