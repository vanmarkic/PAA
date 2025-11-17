import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { routeConfig } from '../types/routes';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb';

export function BreadcrumbNav() {
  const location = useLocation();
  const params = useParams();
  const { language } = useLanguage();

  // Generate breadcrumb items based on the current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    // Always add home
    breadcrumbs.push({
      path: '/',
      label: routeConfig['/'].breadcrumb[language],
      isLast: pathSegments.length === 0,
    });

    // Build the breadcrumb path
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      // Handle dynamic segments (like :id)
      if (params.id && segment === params.id) {
        // For workflow detail pages, show the workflow name if available
        breadcrumbs.push({
          path: currentPath,
          label: segment, // In a real app, this would be fetched from the workflow data
          isLast,
        });
      } else {
        // Use route config for static routes
        const routeKey = currentPath.replace(/\/\d+$/, '/:id'); // Replace numeric IDs with :id
        const config = routeConfig[routeKey] || routeConfig[currentPath];

        if (config) {
          breadcrumbs.push({
            path: currentPath,
            label: config.breadcrumb[language],
            isLast,
          });
        } else {
          // Fallback: capitalize the segment
          breadcrumbs.push({
            path: currentPath,
            label: segment.charAt(0).toUpperCase() + segment.slice(1),
            isLast,
          });
        }
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <div className="container px-4 py-2">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <BreadcrumbItem key={crumb.path}>
              {crumb.isLast ? (
                <BreadcrumbPage className="text-sm">
                  {crumb.label}
                </BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink asChild>
                    <Link to={crumb.path} className="text-sm hover:text-primary">
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                  {index < breadcrumbs.length - 1 && (
                    <BreadcrumbSeparator>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </BreadcrumbSeparator>
                  )}
                </>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}