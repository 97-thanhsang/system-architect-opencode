# Setup Guide

## Step-by-Step Setup Instructions

### 1. Install Dependencies

```bash
cd E:\SOURCE\system-architect-opencode
npm install
```

This will install:
- Angular 17+ core packages
- Angular Material
- RxJS
- @auth0/angular-jwt
- jwt-decode

### 2. Configure Jira OAuth

#### Create Jira OAuth App:

1. Visit [Atlassian Developer Console](https://developer.atlassian.com/console/myapps/)
2. Click "Create" → "OAuth 2.0 integration"
3. Name your app: "System Architect OpenCode"
4. Go to "Authorization" section
5. Add redirect URL: `http://localhost:4200/auth/callback`
6. Save the Client ID

#### Update Environment File:

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  jiraClientId: 'YOUR_ACTUAL_CLIENT_ID',
  jiraRedirectUri: 'http://localhost:4200/auth/callback',
  jiraScopes: 'read:me read:jira-user',
  apiUrl: 'http://localhost:4200/api'
};
```

### 3. Start Development Server

```bash
# Start the development server
npm start

# Or use Angular CLI directly
ng serve
```

The app will be available at `http://localhost:4200`

### 4. Build for Production

```bash
# Build for production
npm run build

# Output will be in dist/system-architect-opencode/
```

### 5. Running Tests

```bash
# Run unit tests
npm test

# Run e2e tests
npm run e2e
```

### 6. Code Quality

```bash
# Run linting
ng lint

# Check TypeScript types
npx tsc --noEmit
```

## Project Configuration

### Angular CLI Commands

```bash
# Generate new component
g generate component component-name

# Generate new service
g generate service service-name

# Generate new module
g generate module module-name
```

### Customizing the Theme

Edit `src/styles.scss`:

```scss
// Change primary color
$primary-palette: mat.define-palette(mat.$blue-palette);

// Change accent color  
$accent-palette: mat.define-palette(mat.$orange-palette);
```

### Adding New Menu Items

Edit `src/app/features/modules/fe-module/services/layout.service.ts`:

```typescript
readonly menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', route: 'dashboard', roles: ['FE', 'BE', 'QC', 'BA'] },
  { id: 'new-page', label: 'New Page', icon: 'page', route: 'new-page', roles: ['FE'] }
];
```

## Troubleshooting

### Port Already in Use

```bash
# Use different port
ng serve --port 4201
```

### Node Modules Issues

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Angular Material Icons Not Showing

```bash
# Reinstall Angular Material
ng add @angular-material
```

## Next Steps

After setup, you can:

1. **Customize the UI**: Edit components in `src/app/features/`
2. **Add New Features**: Create new modules following existing structure
3. **Integrate Real Jira API**: Replace mock auth with real API calls
4. **Add Tests**: Write unit and e2e tests
5. **Deploy**: Build and deploy to your hosting platform

## Support

For issues or questions:
- Check the main README.md
- Review Angular documentation: https://angular.io/docs
- Check OpenCode documentation: https://opencode.ai/docs
