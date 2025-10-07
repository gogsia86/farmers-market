# API Integration

## Overview
API design and integration patterns for the NextJS application.

## Dependencies
- [Core Architecture DNA](../CORE/ARCHITECTURE_DNA.instructions.md)
- [Security Framework](../SECURITY_DIVINITY/SECURITY_GUIDE.instructions.md)
- [Performance Alchemy](../PERFORMANCE_ALCHEMY/INDEX.instructions.md)

## API Patterns

### RESTful Endpoints
```typescript
interface APIEndpoints {
  farms: {
    list: () => Promise<Farm[]>;
    get: (id: string) => Promise<Farm>;
    create: (data: FarmData) => Promise<Farm>;
    update: (id: string, data: Partial<FarmData>) => Promise<Farm>;
    delete: (id: string) => Promise<void>;
  };
  crops: {
    list: (farmId: string) => Promise<Crop[]>;
    get: (id: string) => Promise<Crop>;
    create: (data: CropData) => Promise<Crop>;
    update: (id: string, data: Partial<CropData>) => Promise<Crop>;
    delete: (id: string) => Promise<void>;
  };
}
```

### API Client
```typescript
interface APIClient {
  request<T>(endpoint: string, options: RequestOptions): Promise<T>;
  handleError(error: APIError): void;
  authenticate(credentials: AuthCredentials): Promise<AuthToken>;
  refreshToken(token: AuthToken): Promise<AuthToken>;
}
```

### Response Handling
```typescript
interface ResponseHandler {
  parseResponse<T>(response: APIResponse): T;
  handleError(error: APIError): void;
  validateData<T>(data: T, schema: Schema): boolean;
  cacheResponse<T>(key: string, data: T): void;
}
```

## Implementation Examples

### API Routes
```typescript
// pages/api/farms/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/api-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        const farm = await prisma.farm.findUnique({
          where: { id: String(id) }
        });
        if (!farm) throw new Error('Farm not found');
        return res.status(200).json(farm);

      case 'PUT':
        const validatedData = validateRequest(req.body);
        const updatedFarm = await prisma.farm.update({
          where: { id: String(id) },
          data: validatedData
        });
        return res.status(200).json(updatedFarm);

      case 'DELETE':
        await prisma.farm.delete({
          where: { id: String(id) }
        });
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
```

### API Client Usage
```typescript
const api = new APIClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Using the API client
const FarmManager = () => {
  const { data: farms, error } = useSWR('/api/farms', api.farms.list);

  if (error) return <ErrorDisplay error={error} />;
  if (!farms) return <Loading />;

  return (
    <div>
      {farms.map(farm => (
        <FarmCard key={farm.id} farm={farm} />
      ))}
    </div>
  );
};
```