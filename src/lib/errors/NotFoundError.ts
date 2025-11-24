/**
 * RESOURCE NOT FOUND ERROR
 * For missing resources
 */

import { ApplicationError } from "./ApplicationError";

export class NotFoundError extends ApplicationError {
  public readonly resourceType: string;
  public readonly resourceId: string;

  constructor(resourceType: string, resourceId: string) {
    super(
      `${resourceType} with id ${resourceId} not found`,
      "NOT_FOUND_ERROR",
      "RESOURCE_ACCESS",
      { resourceType, resourceId },
    );
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}
