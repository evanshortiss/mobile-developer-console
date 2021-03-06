import React, { Component } from 'react';
import { EmptyState, Spinner } from 'patternfly-react';
import { connect } from 'react-redux';
import { partition } from 'lodash-es';
import BoundServiceRow from './BoundServiceRow';
import UnboundServiceRow from './UnboundServiceRow';
import './MobileServiceView.css';
import DataService from '../../DataService';
import { fetchBindings } from '../../actions/serviceBinding';

class MobileServiceView extends Component {
  constructor(props) {
    super(props);
    this.boundServiceRows = this.boundServiceRows.bind(this);
    this.unboundServiceRows = this.unboundServiceRows.bind(this);
    this.addDefaultBindingProperty = this.addDefaultBindingProperty.bind(this);
  }

  componentDidMount() {
    const { appName } = this.props;
    this.wsServices = DataService.watchServices(() => {
      this.props.fetchBindings(appName);
    });
  }

  componentWillUnmount() {
    this.wsServices && this.wsServices.close();
  }

  boundServiceRows() {
    return (
      <React.Fragment>
        <h2 key="bound-services">Bound Services</h2>
        {this.props.boundServices && this.props.boundServices.length > 0 ? (
          this.props.boundServices.map(service => {
            this.addDefaultBindingProperty(service);
            return <BoundServiceRow key={service.getId()} service={service} />;
          })
        ) : (
          <EmptyState>There are no bound services.</EmptyState>
        )}
      </React.Fragment>
    );
  }

  unboundServiceRows() {
    return (
      <React.Fragment>
        <h2 key="unbound-services">Unbound Services</h2>
        {this.props.unboundServices && this.props.unboundServices.length > 0 ? (
          this.props.unboundServices.map(service => {
            this.addDefaultBindingProperty(service);
            return <UnboundServiceRow key={service.getId()} service={service} />;
          })
        ) : (
          <EmptyState>There are no unbound services.</EmptyState>
        )}
      </React.Fragment>
    );
  }

  shouldComponentUpdate() {
    return true;
  }

  // This makes the field in the binding form set to the mobile client name
  addDefaultBindingProperty(service) {
    service.setBindingSchemaDefaultValues('CLIENT_ID', this.props.appName);
  }

  render() {
    const { isReading = true, boundServices, unboundServices } = this.props;
    return (
      <div className="mobile-service-view">
        <Spinner
          loading={isReading && boundServices.length === 0 && unboundServices.length === 0}
          className="spinner-padding"
        >
          {this.boundServiceRows()}
          {this.unboundServiceRows()}
        </Spinner>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const filteredServices = partition(state.serviceBindings.services, service => service.isBound());
  return { ...state.serviceBindings, boundServices: filteredServices[0], unboundServices: filteredServices[1] };
}

const mapDispatchToProps = {
  fetchBindings
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MobileServiceView);
