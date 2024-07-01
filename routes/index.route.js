import clientRoute from './user.route.js'



export default (router) => {
  router.use("/",clientRoute);
 
  return router;
};