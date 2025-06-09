# Algorithm Comparison Experiment

This project compares different ride-matching algorithms on synthetic driver and trip data. The comparison includes Batched Hungarian, Stable Matching, and a LinUCB-based Bandit Meta-Selector.

## Prerequisites

1. **Clone this repository** and navigate to the project directory.

2. **Install required packages** (make sure you have Python 3.8+):

    ```bash
    pip install -r requirements.txt
    ```

## Running the Experiment

1. **Prepare your data**:  
   - Download at https://drive.google.com/drive/u/0/folders/1LAuDlGRbC7jAtz0azap59H2cZL82qF2M

2. **Run the notebook** for the experiment and results:

    ```bash
    jupyter notebook experiment/code/notebook.ipynb
    ```

   - Open the notebook in your browser.
   - Follow the steps/cells in the notebook to run the full experiment.

## Output

- The script will:
    - Simulate ride-matching with consistent driver initialization across different algorithms.
    - Save the decision log of the Bandit Meta-Selector (if enabled) to `bandit_matching_history.csv`.
    - Display and plot comparison metrics such as completed trips, cancellation rate, average waiting time, driver earnings, and runtime for each algorithm.

## Customization

- You can change the data paths, number of drivers, or time range in the `main()` function in your code.
- To add more algorithms to compare, edit the `algorithms` list in the `run_algorithm_comparison` function.

---

**Contact**:  
For any issues or questions, please open an issue or contact the maintainer.

