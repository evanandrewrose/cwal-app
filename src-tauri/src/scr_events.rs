use std::{collections::VecDeque, sync::Mutex};

use serde::Serialize;
use url::Url;

use crate::star_cache::StarCache;

static MAXIMUM_HELD_ENTRIES: usize = 30;

#[derive(Debug, PartialEq, Clone)]
pub enum ScrNetworkRequest {
    GameLoadingProfile { alias: String, gateway: u8 },
    Tooninfo { alias: String, gateway: u8 },
    LeaderboardByToon { alias: String, gateway: u8 },
    GameLoading { url: String },
    ChatPanel { url: String },
    MapPreview { hash: String },
    Unparsable { url: String },
    ToastPanel { url: String },
    Unknown { url: String },
}

/// Returns a `ScrNetworkRequest` from a given URL, which gives an id to the url as well as parses
/// relevant information from it.
impl From<String> for ScrNetworkRequest {
    fn from(url: String) -> Self {
        // Parsing URL parts
        let url_parsed = Url::parse(&url);

        return match url_parsed {
            Ok(url_parsed) => {
                let segments = url_parsed.path_segments().unwrap().collect::<Vec<&str>>();

                if url.contains("web-api/v2/aurora-profile-by-toon")
                    && url.contains("request_flags=scr_tooninfo")
                {
                    let alias = segments[3];
                    let gateway = segments[4].parse::<u8>();
                    match gateway {
                        Ok(gateway) => ScrNetworkRequest::Tooninfo {
                            alias: String::from(alias),
                            gateway,
                        },
                        Err(_) => ScrNetworkRequest::Unknown { url },
                    }
                } else if url.contains("web-api/v2/aurora-profile-by-toon")
                    && url.contains("request_flags=scr_mmgameloading")
                {
                    let alias = segments[3];
                    let gateway = segments[4].parse::<u8>();
                    match gateway {
                        Ok(gateway) => ScrNetworkRequest::GameLoadingProfile {
                            alias: String::from(alias),
                            gateway,
                        },
                        Err(_) => ScrNetworkRequest::Unknown { url },
                    }
                } else if url.contains("web-api/v1/leaderboard-rank-by-toon") {
                    let alias = segments[4];
                    let gateway = segments[5].parse::<u8>();
                    match gateway {
                        Ok(gateway) => ScrNetworkRequest::LeaderboardByToon {
                            alias: String::from(alias),
                            gateway,
                        },
                        Err(_) => ScrNetworkRequest::Unknown { url },
                    }
                } else if url.contains("MatchmakingGameLoadingPanel/MatchmakingGameLoadingPanel") {
                    ScrNetworkRequest::GameLoading { url }
                } else if url.contains("ChatPanel/ChatPanel.html") {
                    ScrNetworkRequest::ChatPanel { url }
                } else if url.contains("ToastPanel/ToastPanel.html") {
                    ScrNetworkRequest::ToastPanel { url }
                } else if url.contains("map-preview.bmp") {
                    ScrNetworkRequest::MapPreview {
                        hash: url_parsed
                            .query_pairs()
                            .find(|(k, _)| k == "hash")
                            .unwrap()
                            .1
                            .to_string(),
                    }
                } else {
                    ScrNetworkRequest::Unknown { url }
                }
            }
            Err(_) => ScrNetworkRequest::Unparsable { url },
        };
    }
}

/// Watched for SCR-related cache events.
pub struct ScrNetworkRequestEventReceiver {
    _star_cache: StarCache,
}

impl ScrNetworkRequestEventReceiver {
    /// Creates a new `ScrCacheNotifier` instance.
    pub fn new(event_handler: Mutex<Box<dyn FnMut(ScrNetworkRequest) + Send>>) -> Self {
        let star_cache = StarCache::new(Mutex::new(Box::new(move |entry| {
            event_handler.lock().unwrap()(ScrNetworkRequest::from(entry));
        })));
        ScrNetworkRequestEventReceiver { _star_cache: star_cache }
    }
}

#[allow(dead_code)]
#[derive(Debug, Serialize, Clone)]
pub struct Player {
    alias: String,
    gateway: u8,
}

/// Responsible for receiving events from the cache and deriving an "SCR" event from them.
#[derive(Debug, Serialize, Clone)]
pub enum ScrEvent {
    // tooninfo -> leaderboardbytoon -> chatpanel
    ProfileSelect {
        alias: String,
        gateway: u8,
    },
    MatchFound {
        player1: Player,
        player2: Player,
        map: String,
    },
    GameEnded,
}

pub struct ScrEventsReceiver {
    _recv: ScrNetworkRequestEventReceiver,
}

// Receives scr logical events (e.g., a profile was selected or a game was initiated, etc.). It
// does this by listening to network requests and constructing an event from them.
impl ScrEventsReceiver {
    pub fn listen<F: FnMut(ScrEvent) -> ()>(mut event_handler: F) -> () {
        let mut events = VecDeque::new();

        let (tx, rx) = std::sync::mpsc::channel::<ScrNetworkRequest>();

        let _network_request_receiver =
            ScrNetworkRequestEventReceiver::new(Mutex::new(Box::new(move |entry| {
                let _ = tx.send(entry);
            })));

        for received in rx {
            //println!("Received a network request event: {:?}", received);
            let mut derived_event = None;

            match received {
                ScrNetworkRequest::GameLoadingProfile { ref alias, gateway } => {
                    let map = events.iter().rev().take(30).find(|event| match event {
                        ScrNetworkRequest::MapPreview { .. } => true,
                        _ => false,
                    });

                    let other_player = events.iter().rev().take(30).find(|event| match event {
                        ScrNetworkRequest::GameLoadingProfile { alias: other_alias, gateway: other_gateway } => {
                            other_alias != alias || other_gateway != &gateway
                        },
                        _ => false,
                    });

                    if let Some(ScrNetworkRequest::MapPreview { hash }) = map {
                        if let Some(ScrNetworkRequest::GameLoadingProfile {
                            alias: other_alias,
                            gateway: other_gateway,
                        }) = other_player
                        {
                            derived_event = Some(ScrEvent::MatchFound {
                                player1: Player {
                                    alias: alias.clone(),
                                    gateway: gateway,
                                },
                                player2: Player {
                                    alias: other_alias.clone(),
                                    gateway: *other_gateway,
                                },
                                map: hash.clone(),
                            });
                        }
                    }
                }
                ScrNetworkRequest::ChatPanel { .. } => {
                    // try to find the most recent preceding leaderboard event by toon event, it should
                    // be in the most recent 5 or so events
                    let leaderboard_event = events.iter().rev().take(5).find(|event| match event {
                        ScrNetworkRequest::LeaderboardByToon { .. } => true,
                        _ => false,
                    });

                    // if we found a leaderboard event, we can derive a profile select event
                    if let Some(leaderboard_event) = leaderboard_event {
                        match leaderboard_event {
                            ScrNetworkRequest::LeaderboardByToon { alias, gateway } => {
                                derived_event = Some(ScrEvent::ProfileSelect {
                                    alias: alias.clone(),
                                    gateway: *gateway,
                                });
                            }
                            _ => {}
                        }
                    }
                }
                ScrNetworkRequest::ToastPanel { .. } => {
                    derived_event = Some(ScrEvent::GameEnded);
                }
                _ => {}
            }

            if let Some(received) = derived_event {
                event_handler(received);
                events.clear();
            }

            events.push_back(received);

            if events.len() > MAXIMUM_HELD_ENTRIES {
                events.pop_front();
            }
        }
    }
}
