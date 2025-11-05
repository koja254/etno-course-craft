import Resource from "../models/resource.model.js";

export async function createResource(data) {
  const resource = await Resource.create({
    name: data.name,
    type: data.type,
    url: data.url,
  });
  return resource;
}

export async function listResources(options = {}) {
  const { limit, offset } = options;
  const resources = await Resource.findAll({ limit, offset, order: [["created_at", "DESC"]] });
  return resources;
}

export async function getResourceById(id) {
  const resource = await Resource.findByPk(id);
  return resource;
}

export async function updateResource(id, updates) {
  const resource = await Resource.findByPk(id);
  if (!resource) return null;
  await resource.update(updates);
  return resource;
}

export async function deleteResource(id) {
  const resource = await Resource.findByPk(id);
  if (!resource) return false;
  await resource.destroy();
  return true;
}



