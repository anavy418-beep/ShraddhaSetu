"use client";

import React from "react";

export default class KundliErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Kundli page crash prevented:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="section">
          <div className="container">
            <div className="card">
              <div className="card-body">
                <h3 style={{ marginTop: 0, color: "#5f1c1f" }}>Kundli is temporarily unavailable</h3>
                <p style={{ marginBottom: 0, color: "#6f5b4d" }}>
                  Demo Kundli loaded
                </p>
              </div>
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
