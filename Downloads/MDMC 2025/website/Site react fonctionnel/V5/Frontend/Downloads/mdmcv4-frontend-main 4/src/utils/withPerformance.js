import React from 'react';
import performanceMonitor from './performance';

const withPerformance = (WrappedComponent, componentName) => {
  return class WithPerformance extends React.Component {
    constructor(props) {
      super(props);
      this.startTime = performance.now();
    }

    componentDidMount() {
      performanceMonitor.measureComponentRender(componentName, this.startTime);
    }

    componentDidUpdate() {
      performanceMonitor.measureComponentRender(`${componentName}_update`, this.startTime);
      this.startTime = performance.now();
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
};

export default withPerformance; 