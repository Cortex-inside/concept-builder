/* eslint-disable */
// @ts-nocheck
// This file is generated from the file routes.
import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as DirectoryRouteImport } from './routes/directory'
import { Route as CompanyRouteImport } from './routes/companies.$companyId'
import { Route as LoginRouteImport } from './routes/login'
import { Route as RegisterRouteImport } from './routes/register'
import { Route as DashboardRouteImport } from './routes/dashboard'
import { Route as ProfileRouteImport } from './routes/dashboard.profile'
import { Route as RequestsRouteImport } from './routes/requests'
import { Route as NewRequestRouteImport } from './routes/requests.new'
import { Route as ProposalsRouteImport } from './routes/proposals'
import { Route as ProposalRouteImport } from './routes/proposals.$proposalId'
import { Route as PlansRouteImport } from './routes/plans'
import { Route as DashboardDocumentsRouteImport } from './routes/dashboard.documents'

const IndexRoute=IndexRouteImport.update({id:'/',path:'/',getParentRoute:()=>rootRouteImport} as any)
const DirectoryRoute=DirectoryRouteImport.update({id:'/directory',path:'/directory',getParentRoute:()=>rootRouteImport} as any)
const CompanyRoute=CompanyRouteImport.update({id:'/companies/$companyId',path:'/companies/$companyId',getParentRoute:()=>rootRouteImport} as any)
const LoginRoute=LoginRouteImport.update({id:'/login',path:'/login',getParentRoute:()=>rootRouteImport} as any)
const RegisterRoute=RegisterRouteImport.update({id:'/register',path:'/register',getParentRoute:()=>rootRouteImport} as any)
const DashboardRoute=DashboardRouteImport.update({id:'/dashboard',path:'/dashboard',getParentRoute:()=>rootRouteImport} as any)
const ProfileRoute=ProfileRouteImport.update({id:'/dashboard/profile',path:'/dashboard/profile',getParentRoute:()=>rootRouteImport} as any)
const RequestsRoute=RequestsRouteImport.update({id:'/requests',path:'/requests',getParentRoute:()=>rootRouteImport} as any)
const NewRequestRoute=NewRequestRouteImport.update({id:'/requests/new',path:'/requests/new',getParentRoute:()=>rootRouteImport} as any)
const ProposalsRoute=ProposalsRouteImport.update({id:'/proposals',path:'/proposals',getParentRoute:()=>rootRouteImport} as any)
const ProposalRoute=ProposalRouteImport.update({id:'/proposals/$proposalId',path:'/proposals/$proposalId',getParentRoute:()=>rootRouteImport} as any)
const PlansRoute=PlansRouteImport.update({id:'/plans',path:'/plans',getParentRoute:()=>rootRouteImport} as any)
const DashboardDocumentsRoute=DashboardDocumentsRouteImport.update({id:'/dashboard/documents',path:'/dashboard/documents',getParentRoute:()=>rootRouteImport} as any)

export interface FileRoutesByFullPath {
 '/': typeof IndexRoute
 '/directory': typeof DirectoryRoute
 '/companies/$companyId': typeof CompanyRoute
 '/login': typeof LoginRoute
 '/register': typeof RegisterRoute
 '/dashboard': typeof DashboardRoute
 '/dashboard/profile': typeof ProfileRoute
 '/requests': typeof RequestsRoute
 '/requests/new': typeof NewRequestRoute
 '/proposals': typeof ProposalsRoute
 '/proposals/$proposalId': typeof ProposalRoute
 '/plans': typeof PlansRoute
 '/dashboard/documents': typeof DashboardDocumentsRoute
}
export interface FileRoutesByTo extends FileRoutesByFullPath {}
export interface FileRoutesById {
 __root__: typeof rootRouteImport
 '/': typeof IndexRoute
 '/directory': typeof DirectoryRoute
 '/companies/$companyId': typeof CompanyRoute
 '/login': typeof LoginRoute
 '/register': typeof RegisterRoute
 '/dashboard': typeof DashboardRoute
 '/dashboard/profile': typeof ProfileRoute
 '/requests': typeof RequestsRoute
 '/requests/new': typeof NewRequestRoute
 '/proposals': typeof ProposalsRoute
 '/proposals/$proposalId': typeof ProposalRoute
 '/plans': typeof PlansRoute
 '/dashboard/documents': typeof DashboardDocumentsRoute
}
export interface FileRouteTypes {
 fileRoutesByFullPath: FileRoutesByFullPath
 fullPaths: keyof FileRoutesByFullPath
 fileRoutesByTo: FileRoutesByTo
 to: keyof FileRoutesByTo
 id: keyof FileRoutesById
 fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
 IndexRoute: typeof IndexRoute
 DirectoryRoute: typeof DirectoryRoute
 CompanyRoute: typeof CompanyRoute
 LoginRoute: typeof LoginRoute
 RegisterRoute: typeof RegisterRoute
 DashboardRoute: typeof DashboardRoute
 ProfileRoute: typeof ProfileRoute
 RequestsRoute: typeof RequestsRoute
 NewRequestRoute: typeof NewRequestRoute
 ProposalsRoute: typeof ProposalsRoute
 ProposalRoute: typeof ProposalRoute
 PlansRoute: typeof PlansRoute
 DashboardDocumentsRoute: typeof DashboardDocumentsRoute
}
declare module '@tanstack/react-router' { interface FileRoutesByPath {
 '/': {id:'/';path:'/';fullPath:'/';preLoaderRoute:typeof IndexRouteImport;parentRoute:typeof rootRouteImport}
 '/directory': {id:'/directory';path:'/directory';fullPath:'/directory';preLoaderRoute:typeof DirectoryRouteImport;parentRoute:typeof rootRouteImport}
 '/companies/$companyId': {id:'/companies/$companyId';path:'/companies/$companyId';fullPath:'/companies/$companyId';preLoaderRoute:typeof CompanyRouteImport;parentRoute:typeof rootRouteImport}
 '/login': {id:'/login';path:'/login';fullPath:'/login';preLoaderRoute:typeof LoginRouteImport;parentRoute:typeof rootRouteImport}
 '/register': {id:'/register';path:'/register';fullPath:'/register';preLoaderRoute:typeof RegisterRouteImport;parentRoute:typeof rootRouteImport}
 '/dashboard': {id:'/dashboard';path:'/dashboard';fullPath:'/dashboard';preLoaderRoute:typeof DashboardRouteImport;parentRoute:typeof rootRouteImport}
 '/dashboard/profile': {id:'/dashboard/profile';path:'/dashboard/profile';fullPath:'/dashboard/profile';preLoaderRoute:typeof ProfileRouteImport;parentRoute:typeof rootRouteImport}
 '/requests': {id:'/requests';path:'/requests';fullPath:'/requests';preLoaderRoute:typeof RequestsRouteImport;parentRoute:typeof rootRouteImport}
 '/requests/new': {id:'/requests/new';path:'/requests/new';fullPath:'/requests/new';preLoaderRoute:typeof NewRequestRouteImport;parentRoute:typeof rootRouteImport}
 '/proposals': {id:'/proposals';path:'/proposals';fullPath:'/proposals';preLoaderRoute:typeof ProposalsRouteImport;parentRoute:typeof rootRouteImport}
 '/proposals/$proposalId': {id:'/proposals/$proposalId';path:'/proposals/$proposalId';fullPath:'/proposals/$proposalId';preLoaderRoute:typeof ProposalRouteImport;parentRoute:typeof rootRouteImport}
 '/plans': {id:'/plans';path:'/plans';fullPath:'/plans';preLoaderRoute:typeof PlansRouteImport;parentRoute:typeof rootRouteImport}
 '/dashboard/documents': {id:'/dashboard/documents';path:'/dashboard/documents';fullPath:'/dashboard/documents';preLoaderRoute:typeof DashboardDocumentsRouteImport;parentRoute:typeof rootRouteImport}
}}
const rootRouteChildren:RootRouteChildren={IndexRoute,DirectoryRoute,CompanyRoute,LoginRoute,RegisterRoute,DashboardRoute,ProfileRoute,RequestsRoute,NewRequestRoute,ProposalsRoute,ProposalRoute,PlansRoute,DashboardDocumentsRoute}
export const routeTree=rootRouteImport._addFileChildren(rootRouteChildren)._addFileTypes<FileRouteTypes>()
import type { getRouter } from './router.tsx'
import type { startInstance } from './start.ts'
declare module '@tanstack/react-start' { interface Register { ssr:true; router:Awaited<ReturnType<typeof getRouter>>; config:Awaited<ReturnType<typeof startInstance.getOptions>> } }
