import { Customer } from '../interfaces';

const clients: Customer[] = [
    {
        id: 2,
        username: 'elhadji',
        first_name: 'El Hadji',
        last_name: 'Sarr',
        email: 'client@example.com',
        is_staff: false,
        is_active: true,
        date_joined: new Date(),
        groups: [],
        user_permissions: [],
        user: 1,
      }
]

export const getClient = (clientId: number) => {
    return clients.find(client => client.id == clientId);
}