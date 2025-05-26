import os
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
import json
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
import logging
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.cluster import KMeans
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from scipy import stats

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Data Visualization AI Insights API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enhanced response model
class EnhancedInsightsResponse(BaseModel):
    summary: Optional[str] = None
    correlations: Optional[List[Dict[str, Any]]] = None
    trends: Optional[List[Dict[str, Any]]] = None
    anomalies: Optional[List[Dict[str, Any]]] = None
    predictions: Optional[List[Dict[str, Any]]] = None
    clusters: Optional[List[Dict[str, Any]]] = None
    statistics: Optional[List[Dict[str, Any]]] = None

# Pydantic models
class DatasetRequest(BaseModel):
    data: List[Dict[str, Any]]
    columns: List[str]

class Insight(BaseModel):
    type: str
    description: str
    details: Optional[Dict[str, Any]] = None

class InsightsResponse(BaseModel):
    insights: List[Insight]

# Helper functions for analysis
def get_data_summary(df: pd.DataFrame) -> Dict[str, Any]:
    """Get basic summary statistics of the dataset"""
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=["object"]).columns.tolist()
    
    summary = {
        "rows": len(df),
        "columns": len(df.columns),
        "numeric_columns": numeric_cols,
        "categorical_columns": categorical_cols,
        "missing_values": df.isnull().sum().to_dict(),
    }
    
    if numeric_cols:
        summary["statistics"] = df[numeric_cols].describe().to_dict()
    
    return summary

def get_correlations(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Get correlation matrix for numeric columns"""
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.shape[1] < 2:
        return []
    
    corr_matrix = numeric_df.corr().round(2)
    
    # Find the strongest correlations
    correlations = []
    for i in range(len(corr_matrix.columns)):
        for j in range(i+1, len(corr_matrix.columns)):
            col1 = corr_matrix.columns[i]
            col2 = corr_matrix.columns[j]
            corr_value = corr_matrix.iloc[i, j]
            if abs(corr_value) > 0.3:  # Lower threshold to include more correlations
                correlations.append({
                    "feature1": col1,
                    "feature2": col2,
                    "score": float(corr_value),
                    "description": f"There is a {'strong positive' if corr_value > 0.7 else 'moderate positive' if corr_value > 0.3 else 'strong negative' if corr_value < -0.7 else 'moderate negative'} correlation between {col1} and {col2}."
                })
    
    # Sort by absolute correlation
    correlations.sort(key=lambda x: abs(x["score"]), reverse=True)
    
    return correlations

def get_clustering_info(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Perform K-means clustering on numeric data"""
    numeric_df = df.select_dtypes(include=[np.number])
    
    if numeric_df.shape[1] < 2:
        return []
    
    if numeric_df.shape[0] < 10:
        return []
    
    # Scale the data
    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(numeric_df)
    
    # Determine optimal number of clusters (simplified)
    max_clusters = min(5, numeric_df.shape[0] // 5)
    if max_clusters < 2:
        max_clusters = 2
    
    # K-means with k=3 (simplified)
    kmeans = KMeans(n_clusters=3, random_state=42)
    clusters = kmeans.fit_predict(scaled_data)
    
    # Calculate feature importance for each cluster
    cluster_centers = kmeans.cluster_centers_
    feature_importance = []
    for i in range(len(cluster_centers)):
        # Calculate distance from global mean for each feature
        global_mean = np.mean(scaled_data, axis=0)
        distances = np.abs(cluster_centers[i] - global_mean)
        
        # Normalize to sum to 1
        if np.sum(distances) > 0:
            feature_imp = distances / np.sum(distances)
        else:
            feature_imp = np.ones_like(distances) / len(distances)
        
        feature_importance.append([
            {"name": col, "importance": float(imp)} 
            for col, imp in zip(numeric_df.columns, feature_imp)
        ])
    
    # Get cluster sizes
    cluster_sizes = np.bincount(clusters)
    
    clusters_info = []
    for i in range(len(cluster_centers)):
        # Get the most distinguishing features
        top_features = sorted(feature_importance[i], key=lambda x: x["importance"], reverse=True)[:3]
        
        # Generate description
        feature_desc = ", ".join([f"{f['name']} ({f['importance']:.2f})" for f in top_features])
        
        clusters_info.append({
            "id": i + 1,
            "size": int(cluster_sizes[i]),
            "features": feature_importance[i],
            "description": f"Cluster {i+1} contains {cluster_sizes[i]} records and is characterized by {feature_desc}."
        })
    
    return clusters_info

def get_trend_analysis(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Detect trends in the data with visualization data"""
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.shape[1] < 1:
        return []
    
    trends = []
    
    # Assume index can be a time series for trend analysis
    for col in numeric_df.columns:
        try:
            # Simple linear regression to detect trend
            X = np.arange(len(df)).reshape(-1, 1)
            y = df[col].values
            model = LinearRegression()
            model.fit(X, y)
            
            # Calculate percentage change from start to end
            predicted_start = model.predict([[0]])[0]
            predicted_end = model.predict([[len(df) - 1]])[0]
            
            if abs(predicted_start) > 1e-10:  # Avoid division by zero
                percent_change = 100 * (predicted_end - predicted_start) / abs(predicted_start)
            else:
                percent_change = 0
            
            # Determine direction
            if model.coef_[0] > 0.01:
                direction = "up"
            elif model.coef_[0] < -0.01:
                direction = "down"
            else:
                direction = "stable"
            
            # Generate sample data points for visualization
            data_points = []
            indices = np.linspace(0, len(df) - 1, min(20, len(df)))
            for idx in indices:
                x_val = int(idx)
                y_val = float(model.predict([[x_val]])[0])
                data_points.append({"x": x_val, "y": y_val})
            
            trends.append({
                "feature": col,
                "direction": direction,
                "magnitude": abs(float(percent_change)),
                "description": f"The {col} shows a {direction}ward trend with a {abs(percent_change):.1f}% change over the period.",
                "data": data_points
            })
            
        except Exception as e:
            logger.error(f"Error in trend analysis for column {col}: {str(e)}")
            continue
    
    # Sort by magnitude of change
    trends.sort(key=lambda x: x["magnitude"], reverse=True)
    
    return trends

def detect_anomalies(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Detect anomalies in the dataset"""
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.shape[1] < 1 or numeric_df.shape[0] < 10:
        return []
    
    anomalies = []
    
    # Use Z-score for simple anomaly detection
    for col in numeric_df.columns:
        try:
            z_scores = np.abs(stats.zscore(numeric_df[col]))
            
            # Find anomalies with z-score > 3
            anomaly_indices = np.where(z_scores > 3)[0]
            
            if len(anomaly_indices) > 0:
                # For each anomaly, record details
                for idx in anomaly_indices:
                    value = float(numeric_df[col].iloc[idx])
                    mean = float(numeric_df[col].mean())
                    std = float(numeric_df[col].std())
                    z_score = float(z_scores[idx])
                    
                    # Determine severity based on z-score
                    if z_score > 5:
                        severity = "high"
                    elif z_score > 4:
                        severity = "medium"
                    else:
                        severity = "low"
                    
                    anomalies.append({
                        "feature": col,
                        "value": value,
                        "expected": mean,
                        "severity": severity,
                        "index": int(idx),
                        "description": f"Anomalous value of {value:.2f} detected in {col} (z-score: {z_score:.2f}), expected around {mean:.2f} ± {std:.2f}."
                    })
        
        except Exception as e:
            logger.error(f"Error in anomaly detection for column {col}: {str(e)}")
            continue
    
    # Sort by severity
    severity_rank = {"high": 3, "medium": 2, "low": 1}
    anomalies.sort(key=lambda x: severity_rank.get(x["severity"], 0), reverse=True)
    
    return anomalies

def make_predictions(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Make simple predictions for numeric columns"""
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.shape[1] < 1 or numeric_df.shape[0] < 10:
        return []
    
    predictions = []
    
    # Use simple linear regression for predictions
    for col in numeric_df.columns:
        try:
            # Use index as the predictor
            X = np.arange(len(df)).reshape(-1, 1)
            y = df[col].values
            
            # Fit model
            model = LinearRegression()
            model.fit(X, y)
            
            # Make prediction for next point
            next_point = len(df)
            prediction = float(model.predict([[next_point]])[0])
            
            # Calculate R-squared for confidence
            y_pred = model.predict(X)
            ss_total = np.sum((y - np.mean(y)) ** 2)
            ss_residual = np.sum((y - y_pred) ** 2)
            r_squared = 1 - (ss_residual / ss_total) if ss_total > 0 else 0
            
            # Generate timeline for visualization
            timeline = []
            # Include some historical data
            hist_indices = np.linspace(max(0, len(df) - 10), len(df) - 1, 10)
            for i in hist_indices:
                idx = int(i)
                timeline.append({
                    "time": f"t{idx}",
                    "value": float(y[idx])
                })
            
            # Add predictions for future points
            for i in range(5):
                future_idx = next_point + i
                future_val = float(model.predict([[future_idx]])[0])
                timeline.append({
                    "time": f"t{future_idx}",
                    "value": future_val
                })
            
            current_value = float(y[-1])
            predictions.append({
                "feature": col,
                "current": current_value,
                "predicted": prediction,
                "confidence": float(max(0, min(1, r_squared))),  # Clamp between 0 and 1
                "timeline": timeline,
                "description": f"Based on current trends, {col} is predicted to be {prediction:.2f} (current: {current_value:.2f})."
            })
        
        except Exception as e:
            logger.error(f"Error in prediction for column {col}: {str(e)}")
            continue
    
    # Sort by confidence
    predictions.sort(key=lambda x: x["confidence"], reverse=True)
    
    return predictions

def get_statistics(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Get detailed statistics for each numeric column"""
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.shape[1] < 1:
        return []
    
    statistics = []
    
    for col in numeric_df.columns:
        try:
            series = numeric_df[col].dropna()
            if len(series) > 0:
                stats_dict = {
                    "feature": col,
                    "mean": float(series.mean()),
                    "median": float(series.median()),
                    "min": float(series.min()),
                    "max": float(series.max()),
                    "stdDev": float(series.std())
                }
                statistics.append(stats_dict)
        except Exception as e:
            logger.error(f"Error calculating statistics for column {col}: {str(e)}")
            continue
    
    return statistics

@app.post("/api/insights", response_model=EnhancedInsightsResponse)
async def analyze_data(dataset: DatasetRequest):
    try:
        # Convert to pandas DataFrame
        df = pd.DataFrame(dataset.data)
        
        # Generate enhanced insights
        summary = f"Dataset has {len(df)} rows and {len(df.columns)} columns. "
        summary += "Analysis includes correlations, trends, anomalies, and predictions."
        
        correlations = get_correlations(df)
        trends = get_trend_analysis(df)
        anomalies = detect_anomalies(df)
        predictions = make_predictions(df)
        clusters = get_clustering_info(df)
        statistics = get_statistics(df)
        
        if correlations:
            summary += f" Found {len(correlations)} significant correlations."
        if anomalies:
            summary += f" Detected {len(anomalies)} potential anomalies."
        if trends:
            summary += f" Identified {len(trends)} trends in the data."
            
        return EnhancedInsightsResponse(
            summary=summary,
            correlations=correlations,
            trends=trends,
            anomalies=anomalies,
            predictions=predictions,
            clusters=clusters,
            statistics=statistics
        )
    
    except Exception as e:
        logger.error(f"Error analyzing data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing data: {str(e)}")

# Maintain backward compatibility
@app.post("/api/insights/legacy", response_model=InsightsResponse)
async def analyze_data_legacy(dataset: DatasetRequest):
    try:
        # Convert to pandas DataFrame
        df = pd.DataFrame(dataset.data)
        
        # Generate insights
        insights = generate_insights(df)
        
        return InsightsResponse(insights=insights)
    
    except Exception as e:
        logger.error(f"Error analyzing data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing data: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Data Visualization AI Insights API is running", 
            "docs": "/docs"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True) 