from algorithms import *
from models import *
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from enviroments.simulation import Simulation

class SimulationAnalyzer:
    """Class for analyzing simulation results and creating visualizations"""
    
    def __init__(self, simulation: Simulation):
        self.simulation = simulation
        self.results = simulation.metrics
        self.time_series = simulation.time_series
        
    def plot_waiting_time_distribution(self):
        """Plot distribution of rider waiting times"""
        waiting_times = [r.waiting_time for r in self.simulation.riders.values() 
                        if r.status == RiderStatus.DROPPED_OFF]
        
        plt.figure(figsize=(10, 6))
        sns.histplot(waiting_times, kde=True)
        plt.axvline(np.mean(waiting_times), color='r', linestyle='--', 
                   label=f'Mean: {np.mean(waiting_times):.2f}s')
        plt.title('Distribution of Rider Waiting Times')
        plt.xlabel('Waiting Time (seconds)')
        plt.ylabel('Count')
        plt.legend()
        plt.tight_layout()
        return plt
    
    def plot_driver_earnings_distribution(self):
        """Plot distribution of driver earnings"""
        earnings = [d.total_earnings for d in self.simulation.drivers.values() 
                   if d.trip_history]
        
        plt.figure(figsize=(10, 6))
        sns.histplot(earnings, kde=True)
        plt.axvline(np.mean(earnings), color='r', linestyle='--', 
                  label=f'Mean: ${np.mean(earnings):.2f}')
        plt.title('Distribution of Driver Earnings')
        plt.xlabel('Total Earnings ($)')
        plt.ylabel('Count')
        plt.legend()
        plt.tight_layout()
        return plt
    
    def plot_cancellations_by_hour(self):
        """Plot cancellation counts by hour of day"""
        # Check if cancellations data exists
        if 'cancellations' not in self.time_series or not self.time_series['cancellations']:
            plt.figure(figsize=(12, 6))
            plt.text(0.5, 0.5, 'No cancellation data available', 
                    horizontalalignment='center', verticalalignment='center', fontsize=14)
            plt.title('Cancellations by Hour of Day')
            plt.tight_layout()
            return plt
            
        # Extract hour from cancellation records
        cancel_data = pd.DataFrame(self.time_series['cancellations'], 
                                  columns=['time', 'rider_id', 'reason'])
        cancel_data['hour'] = cancel_data['time'].dt.hour
        
        # Count cancellations by hour
        hourly_counts = cancel_data.groupby('hour').size().reset_index(name='count')
        
        plt.figure(figsize=(12, 6))
        ax = sns.barplot(x='hour', y='count', data=hourly_counts, color='salmon')
        
        # Add value labels to bars
        for i, p in enumerate(ax.patches):
            height = p.get_height()
            ax.text(p.get_x() + p.get_width()/2., height + 0.1,
                  f'{int(height)}', ha='center')
                  
        plt.title('Ride Cancellations by Hour of Day')
        plt.xlabel('Hour of Day')
        plt.ylabel('Number of Cancellations')
        plt.xticks(range(24))
        plt.grid(True, axis='y')
        plt.tight_layout()
        return plt
        
    def plot_cancellation_reasons(self):
        """Plot breakdown of cancellation reasons"""
        # Check if cancellations data exists
        if 'cancellations' not in self.time_series or not self.time_series['cancellations']:
            plt.figure(figsize=(12, 6))
            plt.text(0.5, 0.5, 'No cancellation data available', 
                    horizontalalignment='center', verticalalignment='center', fontsize=14)
            plt.title('Cancellation Reasons')
            plt.tight_layout()
            return plt
            
        # Extract reasons from cancellation records
        cancel_data = pd.DataFrame(self.time_series['cancellations'], 
                                  columns=['time', 'rider_id', 'reason'])
        
        # Process reasons to extract main categories (handle different formats)
        if all(isinstance(r, str) and '(' in r for r in cancel_data['reason']):
            cancel_data['main_reason'] = cancel_data['reason'].str.split('(').str[0].str.strip()
        else:
            cancel_data['main_reason'] = cancel_data['reason']
            
        # Count by reason
        reason_counts = cancel_data['main_reason'].value_counts().reset_index()
        reason_counts.columns = ['reason', 'count']
        
        plt.figure(figsize=(12, 6))
        ax = sns.barplot(x='count', y='reason', data=reason_counts, color='salmon')
        
        # Add value labels to bars
        for i, p in enumerate(ax.patches):
            width = p.get_width()
            ax.text(width + 0.5, p.get_y() + p.get_height()/2,
                  f'{int(width)}', ha='left', va='center')
                  
        plt.title('Cancellation Reasons')
        plt.xlabel('Number of Cancellations')
        plt.ylabel('Reason')
        plt.grid(True, axis='x')
        plt.tight_layout()
        return plt
    
    def plot_cancellation_wait_times(self):
        """Plot distribution of wait times before cancellation"""
        # Check if we have rider data to calculate wait times
        cancelled_riders = [r for r in self.simulation.riders.values() 
                           if r.status == RiderStatus.CANCELLED]
        
        if not cancelled_riders:
            plt.figure(figsize=(10, 6))
            plt.text(0.5, 0.5, 'No cancellation data available', 
                    horizontalalignment='center', verticalalignment='center', fontsize=14)
            plt.title('Distribution of Wait Times Before Cancellation')
            plt.tight_layout()
            return plt
            
        # Get wait times for cancelled rides
        wait_times = [(r.cancel_time - r.request_time).total_seconds() / 60 
                     for r in cancelled_riders if hasattr(r, 'cancel_time') and r.cancel_time]
        
        plt.figure(figsize=(10, 6))
        sns.histplot(wait_times, kde=True, color='salmon')
        if wait_times:
            plt.axvline(np.mean(wait_times), color='r', linestyle='--', 
                      label=f'Mean: {np.mean(wait_times):.2f} mins')
        plt.title('Distribution of Wait Times Before Cancellation')
        plt.xlabel('Wait Time (minutes)')
        plt.ylabel('Count')
        plt.legend()
        plt.tight_layout()
        return plt
    
    def plot_lorenz_curve(self):
        """Plot Lorenz curve for driver earnings inequality"""
        earnings = np.array([d.total_earnings for d in self.simulation.drivers.values() 
                           if d.trip_history])
        
        # Sort earnings
        earnings = np.sort(earnings)
        n = len(earnings)
        
        # Create points on the Lorenz curve
        lorenz_curve = np.cumsum(earnings) / np.sum(earnings)
        
        # Line of perfect equality
        equality_line = np.linspace(0, 1, n)
        
        plt.figure(figsize=(10, 6))
        plt.plot(np.linspace(0, 1, n), lorenz_curve, label='Lorenz Curve')
        plt.plot([0, 1], [0, 1], 'k--', label='Perfect Equality')
        plt.fill_between(np.linspace(0, 1, n), equality_line, lorenz_curve, alpha=0.2, 
                        label=f'Gini = {self.results["gini_coefficient"]:.4f}')
        plt.title('Lorenz Curve of Driver Earnings')
        plt.xlabel('Cumulative Share of Drivers')
        plt.ylabel('Cumulative Share of Earnings')
        plt.legend()
        plt.grid(True)
        plt.tight_layout()
        return plt
    
    def plot_waiting_time_by_hour(self):
        """Plot average waiting time by hour of day"""
        # Extract hour from waiting time records
        waiting_data = pd.DataFrame(self.time_series['waiting_times'], 
                                  columns=['time', 'rider_id', 'waiting_time'])
        waiting_data['hour'] = waiting_data['time'].dt.hour
        
        # Group by hour and calculate mean
        hourly_avg = waiting_data.groupby('hour')['waiting_time'].mean().reset_index()
        
        plt.figure(figsize=(12, 6))
        ax = sns.barplot(x='hour', y='waiting_time', data=hourly_avg)
        
        # Add value labels to bars
        for i, p in enumerate(ax.patches):
            height = p.get_height()
            ax.text(p.get_x() + p.get_width()/2., height + 1,
                  f'{height:.1f}', ha='center')
                  
        plt.title('Average Waiting Time by Hour of Day')
        plt.xlabel('Hour of Day')
        plt.ylabel('Average Waiting Time (seconds)')
        plt.xticks(range(24))
        plt.grid(True, axis='y')
        plt.tight_layout()
        return plt
    
    def plot_trips_vs_cancellations(self):
        """Plot completed trips vs cancellations by hour"""
        # Extract hour from trip completion records
        if 'trip_completions' in self.time_series and self.time_series['trip_completions']:
            trips_data = pd.DataFrame(self.time_series['trip_completions'], 
                                    columns=['time', 'trip_id'])
            trips_data['hour'] = trips_data['time'].dt.hour
            trips_by_hour = trips_data.groupby('hour').size().reset_index(name='completed')
        else:
            trips_by_hour = pd.DataFrame({'hour': range(24), 'completed': 0})
            
        # Extract hour from cancellation records
        if 'cancellations' in self.time_series and self.time_series['cancellations']:
            cancel_data = pd.DataFrame(self.time_series['cancellations'], 
                                      columns=['time', 'rider_id', 'reason'])
            cancel_data['hour'] = cancel_data['time'].dt.hour
            cancels_by_hour = cancel_data.groupby('hour').size().reset_index(name='cancelled')
        else:
            cancels_by_hour = pd.DataFrame({'hour': range(24), 'cancelled': 0})
            
        # Merge the datasets
        hourly_data = pd.merge(trips_by_hour, cancels_by_hour, on='hour', how='outer').fillna(0)
        
        # Calculate cancellation rate
        hourly_data['total'] = hourly_data['completed'] + hourly_data['cancelled'] 
        hourly_data['cancel_rate'] = hourly_data['cancelled'] / hourly_data['total'].replace(0, np.nan)
        
        # Create plot
        fig, ax1 = plt.subplots(figsize=(14, 8))
        
        # Bar chart for completed and cancelled
        width = 0.35
        x = np.arange(len(hourly_data))
        completed_bars = ax1.bar(x - width/2, hourly_data['completed'], width, label='Completed Trips', color='forestgreen')
        cancelled_bars = ax1.bar(x + width/2, hourly_data['cancelled'], width, label='Cancellations', color='salmon')
        
        # Add value labels to bars
        for i, p in enumerate(completed_bars):
            height = p.get_height()
            ax1.text(p.get_x() + p.get_width()/2., height + 0.5,
                  f'{int(height)}', ha='center')
                  
        for i, p in enumerate(cancelled_bars):
            height = p.get_height()
            ax1.text(p.get_x() + p.get_width()/2., height + 0.5,
                  f'{int(height)}', ha='center')
            
        ax1.set_xlabel('Hour of Day')
        ax1.set_ylabel('Count')
        ax1.set_xticks(x)
        ax1.set_xticklabels(hourly_data['hour'])
        ax1.legend(loc='upper left')
        ax1.grid(True, axis='y', alpha=0.3)
        
        # Second y-axis for cancellation rate
        ax2 = ax1.twinx()
        rate_line = ax2.plot(x, hourly_data['cancel_rate'], 'r-o', linewidth=2, markersize=6, 
                color='darkred', label='Cancellation Rate')
                
        # Add rate values above points
        for i, rate in enumerate(hourly_data['cancel_rate']):
            if not np.isnan(rate):
                ax2.text(i, rate + 0.02, f'{rate:.1%}', ha='center')
                
        ax2.set_ylabel('Cancellation Rate')
        ax2.set_ylim(0, min(1, hourly_data['cancel_rate'].max() * 1.5 or 0.1))
        ax2.legend(loc='upper right')
        ax2.grid(False)
        
        plt.title('Completed Trips vs. Cancellations by Hour')
        plt.tight_layout()
        return plt
    
    def plot_trip_heatmap(self):
        """Plot heatmap of trip origins and destinations"""
        trips_df = pd.DataFrame([(t.pickup_location_id, t.dropoff_location_id) 
                               for t in self.simulation.trips.values() if t.is_completed()],
                              columns=['pickup', 'dropoff'])
        
        # Create matrix of zone pairs
        unique_zones = sorted(set(trips_df['pickup'].unique()) | set(trips_df['dropoff'].unique()))
        matrix = pd.crosstab(trips_df['pickup'], trips_df['dropoff'])
        
        # Fill missing zones
        for zone in unique_zones:
            if zone not in matrix.index:
                matrix.loc[zone] = 0
            if zone not in matrix.columns:
                matrix[zone] = 0
        
        # Sort zones for better visualization
        matrix = matrix.sort_index().sort_index(axis=1)
        
        # Plot heatmap (for large matrices, sample top zones by volume)
        if len(unique_zones) > 30:
            # Get top zones by total volume
            zone_volumes = matrix.sum(axis=1) + matrix.sum(axis=0)
            top_zones = zone_volumes.nlargest(30).index
            matrix = matrix.loc[top_zones, top_zones]
        
        plt.figure(figsize=(12, 10))
        sns.heatmap(matrix, cmap="YlGnBu", annot=(len(unique_zones) <= 15))
        plt.title('Trip Origin-Destination Heatmap')
        plt.xlabel('Dropoff Zone')
        plt.ylabel('Pickup Zone')
        plt.tight_layout()
        return plt
    
    def plot_metrics_comparison(self, metrics_list, algorithm_names):
        """
        Compare metrics across different algorithms

        Args:
            metrics_list: List of metrics dictionaries from different algorithm runs
            algorithm_names: List of algorithm names
        """
        # Create comparison DataFrame
        comparison = pd.DataFrame({
            'Algorithm': algorithm_names,
            'Avg Waiting Time (s)': [m['avg_waiting_time'] for m in metrics_list],
            'Avg Trip Time (s)': [m['avg_trip_time'] for m in metrics_list],
            'Avg Driver Earnings ($)': [m['avg_driver_earnings'] for m in metrics_list],
            'Avg Empty Miles': [m['avg_empty_miles'] for m in metrics_list],
            'Cancellation Rate': [m.get('cancellation_rate', 0) for m in metrics_list],
        })

        # Create subplots: 3 rows x 2 columns
        fig, axes = plt.subplots(3, 2, figsize=(15, 18))

        # 1. Average Waiting Time
        ax1 = sns.barplot(x='Algorithm', y='Avg Waiting Time (s)', data=comparison, ax=axes[0, 0])
        for p in ax1.patches:
            height = p.get_height()
            ax1.text(p.get_x() + p.get_width() / 2., height + 5, f'{height:.1f}', ha='center')
        axes[0, 0].set_title('Average Waiting Time')
        axes[0, 0].set_ylabel('Avg Waiting Time (s)')
        axes[0, 0].grid(True, axis='y')

        # 2. Average Trip Time
        ax2 = sns.barplot(x='Algorithm', y='Avg Trip Time (s)', data=comparison, ax=axes[0, 1])
        for p in ax2.patches:
            height = p.get_height()
            ax2.text(p.get_x() + p.get_width() / 2., height + 5, f'{height:.1f}', ha='center')
        axes[0, 1].set_title('Average Trip Time')
        axes[0, 1].set_ylabel('Avg Trip Time (s)')
        axes[0, 1].grid(True, axis='y')

        # 3. Average Driver Earnings
        ax3 = sns.barplot(x='Algorithm', y='Avg Driver Earnings ($)', data=comparison, ax=axes[1, 0])
        for p in ax3.patches:
            height = p.get_height()
            ax3.text(p.get_x() + p.get_width() / 2., height + 0.2, f'${height:.2f}', ha='center')
        axes[1, 0].set_title('Average Driver Earnings')
        axes[1, 0].set_ylabel('Avg Driver Earnings ($)')
        axes[1, 0].grid(True, axis='y')

        # 4. Average Empty Miles
        ax4 = sns.barplot(x='Algorithm', y='Avg Empty Miles', data=comparison, ax=axes[1, 1])
        for p in ax4.patches:
            height = p.get_height()
            ax4.text(p.get_x() + p.get_width() / 2., height + 0.05, f'{height:.2f}', ha='center')
        axes[1, 1].set_title('Average Empty Miles')
        axes[1, 1].set_ylabel('Avg Empty Miles')
        axes[1, 1].grid(True, axis='y')

        # 5. Cancellation Rate
        ax5 = sns.barplot(x='Algorithm', y='Cancellation Rate', data=comparison, ax=axes[2, 0])
        for p in ax5.patches:
            height = p.get_height()
            ax5.text(p.get_x() + p.get_width() / 2., height + 0.01, f'{height:.1%}', ha='center')
        axes[2, 0].set_title('Cancellation Rate')
        axes[2, 0].set_ylabel('Cancellation Rate (%)')
        axes[2, 0].set_ylim(0, min(1, max(comparison['Cancellation Rate']) * 1.2 or 0.1))
        axes[2, 0].grid(True, axis='y')

        # 6. Hide last subplot if unused
        axes[2, 1].axis('off')

        plt.tight_layout()
        return plt

    
    def generate_complete_analysis(self, output_dir=None):
        """Generate and save all analysis plots"""
        plots = {
            'waiting_time_distribution': self.plot_waiting_time_distribution(),
            'driver_earnings_distribution': self.plot_driver_earnings_distribution(),
            'lorenz_curve': self.plot_lorenz_curve(),
            'waiting_time_by_hour': self.plot_waiting_time_by_hour(),
            'trip_heatmap': self.plot_trip_heatmap(),
            'cancellations_by_hour': self.plot_cancellations_by_hour(),
            'cancellation_reasons': self.plot_cancellation_reasons(),
            'cancellation_wait_times': self.plot_cancellation_wait_times(),
            'trips_vs_cancellations': self.plot_trips_vs_cancellations(),
        }
        
        if output_dir:
            import os
            os.makedirs(output_dir, exist_ok=True)
            for name, plot in plots.items():
                plot.savefig(os.path.join(output_dir, f"{name}.png"), dpi=300)
                plot.close()
        
        return plots


    def plot_avg_batch_runtime_bar(self, simulations, algorithm_names):
        """Plot avg run timetime."""
        avg_runtimes = []
        for sim in simulations:
            batch_runtimes = [rt for t, rt in sim.time_series['batch_runtime']]
            avg = np.mean(batch_runtimes) if batch_runtimes else 0
            avg_runtimes.append(avg)
        fig, ax = plt.subplots(figsize=(8, 5))
        bars = ax.bar(algorithm_names, avg_runtimes)
        for bar, val in zip(bars, avg_runtimes):
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2, height + max(avg_runtimes)*0.01,
                    f"{val:.3f}s", ha='center', va='bottom', fontsize=12)
        ax.set_title("Average Batch Runtime per Algorithm")
        ax.set_ylabel("Average Runtime (seconds)")
        ax.set_xlabel("Algorithm")
        ax.grid(axis='y', alpha=0.2)
        plt.tight_layout()
        return plt

    def plot_batch_runtime_comparison(self, simulations, algorithm_names):
        """Plot batch runtime comparison for multiple algorithms."""
        plt.figure(figsize=(14, 7))

        # Các style để tránh trùng
        linestyles = ['-', '--', '-.', ':']
        markers = ['o', 's', 'D', '^', 'v', '<', '>', 'p', '*', 'h', 'x', '+']
        colors = plt.cm.tab10.colors  # 10 màu nổi bật

        for idx, (sim, name) in enumerate(zip(simulations, algorithm_names)):
            ts = sim.time_series if hasattr(sim, 'time_series') else sim.simulation.time_series
            batch_runtime = ts['batch_runtime']
            if not batch_runtime:
                continue
            times, runtimes = zip(*batch_runtime)
            start_time = times[0]
            times_mins = [(t - start_time).total_seconds() / 60 for t in times]

            # Lựa chọn style
            linestyle = linestyles[idx % len(linestyles)]
            marker = markers[idx % len(markers)]
            color = colors[idx % len(colors)]
            # Jitter nhẹ nếu muốn (comment nếu không cần)
            jitter = np.random.uniform(-0.04, 0.04, size=len(runtimes)) if len(simulations) > 1 else 0
            runtimes_jittered = np.array(runtimes) + jitter

            plt.plot(
                times_mins,
                runtimes_jittered,
                marker=marker,
                label=name,
                linewidth=2,
                linestyle=linestyle,
                color=color,
                alpha=0.9,
                markersize=7
            )
        plt.title('Batch Runtime per Algorithm (Lower = Better)')
        plt.xlabel('Simulation Time (minutes)')
        plt.ylabel('Batch Runtime (seconds)')
        plt.legend()
        plt.grid(True, alpha=0.2)
        plt.tight_layout()
        return plt


    def plot_total_runtime_bar(self, metrics_list, algorithm_names):
        """Plot total run time."""
        runtimes = [m.get('runtime_seconds', 0) for m in metrics_list]
        fig, ax = plt.subplots(figsize=(8, 5))
        bars = ax.bar(algorithm_names, runtimes)
        for bar, val in zip(bars, runtimes):
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2, height + max(runtimes)*0.01,
                    f"{val:.2f}s", ha='center', va='bottom', fontsize=12)
        ax.set_title("Total Runtime per Algorithm")
        ax.set_ylabel("Total Runtime (seconds)")
        ax.set_xlabel("Algorithm")
        ax.grid(axis='y', alpha=0.2)
        plt.tight_layout()
        return plt
