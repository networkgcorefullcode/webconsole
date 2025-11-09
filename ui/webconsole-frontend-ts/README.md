# Web Console Frontend TypeScript Project

This project is a TypeScript-based frontend application designed to enhance the existing web console for managing various network components through CRUD operations using an API.

## Project Structure

The project is organized into the following directories and files:

- **src/**: Contains the source code for the application.
  - **main.ts**: Entry point of the application, initializes routing and main components.
  - **config/**: Configuration files for the application.
    - **api.config.ts**: API configuration settings, including base URL and endpoints.
  - **services/**: Contains service classes for API interactions.
    - **api.service.ts**: Base service for making HTTP requests.
    - **deviceGroups.service.ts**: Service for managing device group CRUD operations.
    - **gnbInventory.service.ts**: Service for managing gNodeB inventory.
    - **networkSlices.service.ts**: Service for managing network slices.
    - **subscribers.service.ts**: Service for managing subscribers.
    - **upfInventory.service.ts**: Service for managing UPF inventory.
  - **models/**: Contains TypeScript interfaces defining the structure of various data entities.
  - **modules/**: Contains manager classes that handle operations for different entities.
  - **utils/**: Utility functions for HTTP requests, validation, and formatting.
  - **types/**: Common types and interfaces used throughout the application.

- **public/**: Contains static files served by the application.
  - **index.html**: Main HTML file for the web application.
  - **manifest.json**: Metadata about the web application.

- **package.json**: Configuration file for npm, listing dependencies and scripts.
- **tsconfig.json**: TypeScript configuration file specifying compiler options.
- **.eslintrc.json**: ESLint configuration file for code linting.
- **.prettierrc**: Prettier configuration file for code formatting.
- **README.md**: Documentation for the project.

## Setup Instructions

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd webconsole-frontend-ts
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Run the application**:
   ```
   npm start
   ```

4. **Build the application**:
   ```
   npm run build
   ```

## Usage Guidelines

- The application provides a user-friendly interface for managing network components.
- Each service class corresponds to a specific entity and provides methods for CRUD operations.
- The models define the structure of the data used in the application, ensuring type safety and consistency.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.