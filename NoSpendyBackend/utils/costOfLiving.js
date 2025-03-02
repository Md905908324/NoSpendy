const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Map to store cost of living data by state
const costOfLivingByState = new Map();

// Function to load cost of living data from CSV
function loadCostOfLivingData() {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, '../data/cost_of_living.csv');
    
    console.log('Attempting to load cost of living data from:', filePath);
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Log the first row to see its structure
        if (costOfLivingByState.size === 0) {
          console.log('Sample CSV row:', row);
        }
        
        // The CSV has columns: Rank, State, Index, etc.
        // We need to extract the state name and index
        if (row.State && row.Index) {
          // Get the state abbreviation (we need to create a mapping)
          const stateAbbr = getStateAbbreviation(row.State);
          const costIndex = parseFloat(row.Index);
          
          if (stateAbbr && !isNaN(costIndex)) {
            costOfLivingByState.set(stateAbbr, costIndex);
          }
        }
      })
      .on('end', () => {
        console.log(`Cost of living data loaded successfully from ${filePath}`);
        console.log(`Loaded ${costOfLivingByState.size} state entries`);
        console.log('Sample data:', 
          Array.from(costOfLivingByState.entries()).slice(0, 5));
        resolve(costOfLivingByState);
      })
      .on('error', (error) => {
        console.error('Error loading cost of living data:', error);
        reject(error);
      });
  });
}

// Function to convert state names to abbreviations
function getStateAbbreviation(stateName) {
  const stateMap = {
    'Alabama': 'AL',
    'Alaska': 'AK',
    'Arizona': 'AZ',
    'Arkansas': 'AR',
    'California': 'CA',
    'Colorado': 'CO',
    'Connecticut': 'CT',
    'Delaware': 'DE',
    'District of Columbia': 'DC',
    'Florida': 'FL',
    'Georgia': 'GA',
    'Hawaii': 'HI',
    'Idaho': 'ID',
    'Illinois': 'IL',
    'Indiana': 'IN',
    'Iowa': 'IA',
    'Kansas': 'KS',
    'Kentucky': 'KY',
    'Louisiana': 'LA',
    'Maine': 'ME',
    'Maryland': 'MD',
    'Massachusetts': 'MA',
    'Michigan': 'MI',
    'Minnesota': 'MN',
    'Mississippi': 'MS',
    'Missouri': 'MO',
    'Montana': 'MT',
    'Nebraska': 'NE',
    'Nevada': 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    'Ohio': 'OH',
    'Oklahoma': 'OK',
    'Oregon': 'OR',
    'Pennsylvania': 'PA',
    'Puerto Rico': 'PR',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    'Tennessee': 'TN',
    'Texas': 'TX',
    'Utah': 'UT',
    'Vermont': 'VT',
    'Virginia': 'VA',
    'Washington': 'WA',
    'West Virginia': 'WV',
    'Wisconsin': 'WI',
    'Wyoming': 'WY'
  };
  
  return stateMap[stateName] || null;
}

// Function to get cost of living index for a state
function getCostOfLivingIndex(state) {
  if (!state) return 100;
  
  // Ensure state is uppercase for consistency
  const stateCode = state.toUpperCase();
  
  // Get the cost index or default to 100 (national average)
  const costIndex = costOfLivingByState.get(stateCode);
  
  // Debug log to see what's happening
  console.log(`Getting cost index for ${stateCode}: ${costIndex || 100}`);
  
  return costIndex || 100;
}

// Function to adjust spending based on state's cost of living
function adjustSpendingForState(spending, state) {
  if (!state) return spending;
  
  const costIndex = getCostOfLivingIndex(state);
  // Adjust spending relative to national average (100)
  return (spending * 100) / costIndex;
}

module.exports = {
  loadCostOfLivingData,
  getCostOfLivingIndex,
  adjustSpendingForState,
  costOfLivingByState  // Export the map for debugging
}; 