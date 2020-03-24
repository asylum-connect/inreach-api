import {
  ORG_PAGE_LIMIT,
  getOrganizationQuery,
  handleBadRequest,
  handleErr
} from '../utils';
import {Organization} from '../mongoose';

export const organizationDelete = async (req, res) => {
  const {orgId} = req?.params;

  await Organization.findByIdAndDelete(orgId)
    .then(() => {
      // TODO: check and send 404
      return res.json({deleted: true});
    })
    .catch(err => handleErr(err, res));
};

export const organizationGet = async (req, res) => {
  const {orgId} = req?.params;

  await Organization.findById(orgId)
    .then(organization => {
      // TODO: check and send 404
      return res.json(organization);
    })
    .catch(err => handleErr(err, res));
};

export const organizationUpdate = async (req, res) => {
  const {orgId} = req?.params;
  const body = req?.body;
  const updated_at = Date.now();

  if (!body) {
    return handleBadRequest(res);
  }

  await Organization.findOneAndUpdate(
    {_id: orgId},
    {$set: {...body, updated_at}}
  )
    .then(() => {
      // TODO: check and send 404
      return res.json({updated: true});
    })
    .catch(err => handleErr(err, res));
};

export const organizationsCreate = async (req, res) => {
  const body = req?.body;
  const org = new Organization(body);

  if (!body) {
    return handleBadRequest(res);
  }

  await org
    .save()
    .then(organization => {
      return res.json({created: true, organization});
    })
    .catch(err => handleErr(err, res));
};

export const organizationsGet = async (req, res) => {
  const {params, query} = getOrganizationQuery(req?.query);

  await Organization.find(query)
    .sort({updated_at: -1})
    .skip(params.offset)
    .limit(params.limit)
    .then(organizations => {
      return res.json({organizations});
    })
    .catch(err => handleErr(err, res));
};

export const organizationsGetCount = async (req, res) => {
  const {query} = getOrganizationQuery(req?.query);

  await Organization.countDocuments(query)
    .then(count => {
      const pages = Math.ceil(count / ORG_PAGE_LIMIT);

      return res.json({count, pages});
    })
    .catch(err => handleErr(err, res));
};

export const serviceDelete = async (req, res) => {
  const {orgId, serviceId} = req?.params;

  await Organization.findById(orgId)
    .then(organization => {
      return organization.services
        .id(serviceId)
        .remove()
        .then(() => {
          // TODO: check and send 404
          return res.json({deleted: true});
        })
        .catch(err => handleErr(err, res));
    })
    .catch(err => handleErr(err, res));
};

export const serviceGet = async (req, res) => {
  const {orgId, serviceId} = req?.params;

  await Organization.findById(orgId)
    .then(orgDocument => {
      const serviceDocument = orgDocument.services.id(serviceId);
      const service = {
        ...(serviceDocument?.toJSON() || {}),
        organization: {
          ...(orgDocument?.toJSON() || {}),
          services: undefined
        }
      };

      // TODO: check and send 404
      return res.json(service);
    })
    .catch(err => handleErr(err, res));
};

export const serviceUpdate = async (req, res) => {
  const {orgId, serviceId} = req?.params;
  const body = req?.body;
  const updated_at = Date.now();

  if (!body) {
    return handleBadRequest(res);
  }

  await Organization.findOneAndUpdate(
    {_id: orgId, 'services._id': serviceId},
    {$set: {'services.$': {...body, _id: serviceId, updated_at}}}
  )
    .then(() => {
      // TODO: check and send 404
      return res.json({updated: true});
    })
    .catch(err => handleErr(err, res));
};

export const servicesCreate = async (req, res) => {
  const {orgId} = req?.params;
  const body = req?.body;

  if (!body) {
    return handleBadRequest(res);
  }

  await Organization.findById(orgId)
    .then(organization => {
      organization.services.push(body);

      return organization
        .save()
        .then(() => {
          return res.json({created: true});
        })
        .catch(err => handleErr(err, res));
    })
    .catch(err => handleErr(err, res));
};

export const servicesGet = async (req, res) => {
  const {orgId} = req?.params;

  await Organization.findById(orgId)
    .then(({services = []}) => {
      // TODO: check and send 404
      return res.json({services});
    })
    .catch(err => handleErr(err, res));
};
