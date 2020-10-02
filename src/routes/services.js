import _reduce from 'lodash/reduce';

import {
  formatService,
  handleBadRequest,
  handleErr,
  handleNotFound,
  orderServices,
} from '../utils';
import {
  getOrganizationQuery,
} from '../utils/query';
import {Organization} from '../mongoose';

export const getServicesCount = async (req, res) => {
  const query = getOrganizationQuery(req?.query);
  await Organization.aggregate([
    {$match: query},
    {$unwind: "$services"},
    {$group: {_id:0, total:{$sum:1}}}
  ]).then((resp) => {
    return res.json({count: resp[0].total});
  })
    .catch((err) => handleErr(err, res));
};

export const getServices = async (req, res) => {
  const {orgId} = req?.params;

  await Organization.findById(orgId)
    .then((orgDoc) => {
      if (!orgDoc) {
        return handleNotFound(res);
      }

      let services = orgDoc?.services || [];

      services = orderServices(services);

      return res.json({services});
    })
    .catch((err) => handleErr(err, res));
};

export const createService = async (req, res) => {
  const {orgId} = req?.params;
  const body = req?.body;

  if (!body) {
    return handleBadRequest(res);
  }

  await Organization.findById(orgId)
    .then(async (organization) => {
      if (!organization) {
        return handleNotFound(res);
      }

      organization.services.push(body);

      await organization
        .save()
        .then(() => {
          return res.json({created: true});
        })
        .catch((err) => handleErr(err, res));
    })
    .catch((err) => handleErr(err, res));
};

export const deleteService = async (req, res) => {
  const {orgId, serviceId} = req?.params;

  await Organization.findById(orgId)
    .then((organization) => {
      if (!organization) {
        return handleNotFound(res);
      }

      organization.services.id(serviceId).remove();

      organization
        .save()
        .then(() => {
          return res.json({deleted: true});
        })
        .catch((err) => handleErr(err, res));
    })
    .catch((err) => handleErr(err, res));
};

export const getService = async (req, res) => {
  const {orgId, serviceId} = req?.params;

  await Organization.findById(orgId)
    .then((orgDoc) => {
      if (!orgDoc) {
        return handleNotFound(res);
      }

      const serviceDoc = orgDoc.services.id(serviceId);

      if (!serviceDoc) {
        return handleNotFound(res);
      }

      const service = formatService(
        serviceDoc?.toJSON() || {},
        orgDoc?.toJSON() || {}
      );

      return res.json(service);
    })
    .catch((err) => handleErr(err, res));
};

export const updateService = async (req, res) => {
  const {orgId, serviceId} = req?.params;
  const body = req?.body;
  const updated_at = Date.now();

  if (!body) {
    return handleBadRequest(res);
  }

  const updates = _reduce(
    body,
    (result, value, key) => {
      result[`services.$.${key}`] = value;

      return result;
    },
    {
      'services.$._id': serviceId,
      'services.$.updated_at': updated_at,
    }
  );

  await Organization.findOneAndUpdate(
    {_id: orgId, 'services._id': serviceId},
    {$set: updates}
  )
    .then((orgDoc) => {
      if (!orgDoc) {
        return handleNotFound(res);
      }

      return res.json({updated: true});
    })
    .catch((err) => handleErr(err, res));
};

export const getServiceBySlug = async (req, res) => {
  const {orgSlug, serviceSlug} = req?.params;

  await Organization.findOne({slug: orgSlug})
    .then((orgDoc) => {
      if (!orgDoc) {
        return handleNotFound(res);
      }

      const serviceDoc = orgDoc.services.find(
        (service) => service.slug === serviceSlug
      );

      if (!serviceDoc) {
        return handleNotFound(res);
      }

      const service = {
        ...(serviceDoc?.toJSON() || {}),
        organization: {
          ...(orgDoc?.toJSON() || {}),
          services: undefined,
        },
      };

      return res.json(service);
    })
    .catch((err) => handleErr(err, res));
};
