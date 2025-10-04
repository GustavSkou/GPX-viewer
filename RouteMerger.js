class RouteMerger {

  /**
   * Merge multiple routes
   * @param {Route[]} routes 
   */
  static merge(routes) {
    const points = [];
    
    routes.forEach(route => {
      points.push(...route.points);
    });

    const resultName = routes[0].name;
    const resultType = routes[0].type;
    
    const resultRoute = new Route(
      resultName, 
      resultType, 
      points
    );
    return resultRoute;
  }
}