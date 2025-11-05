import {
  createResource,
  listResources,
  getResourceById,
  updateResource,
  deleteResource,
} from "../services/resource.service.js";

export async function createResourceHandler(req, res) {
  try {
    const { name, type, url } = req.body;
    if (!name || !type || !url) {
      return res
        .status(400)
        .json({ message: "name, type and url are required" });
    }
    const resource = await createResource({ name, type, url });
    return res.status(201).json(resource);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create resource", error: error.message });
  }
}

export async function listResourcesHandler(req, res) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset) : undefined;
    const resources = await listResources({ limit, offset });
    return res.json(resources);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to list resources", error: error.message });
  }
}

export async function getResourceByIdHandler(req, res) {
  try {
    const { id } = req.params;
    const resource = await getResourceById(id);
    if (!resource)
      return res.status(404).json({ message: "Resource not found" });
    return res.json(resource);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch resource", error: error.message });
  }
}

export async function updateResourceHandler(req, res) {
  try {
    const { id } = req.params;
    const { name, type, url } = req.body;
    const resource = await updateResource(id, { name, type, url });
    if (!resource)
      return res.status(404).json({ message: "Resource not found" });
    return res.json(resource);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update resource", error: error.message });
  }
}

export async function deleteResourceHandler(req, res) {
  try {
    const { id } = req.params;
    const ok = await deleteResource(id);
    if (!ok) return res.status(404).json({ message: "Resource not found" });
    return res.status(204).send();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete resource", error: error.message });
  }
}
